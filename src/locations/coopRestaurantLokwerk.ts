/* eslint-disable prefer-destructuring */
import axios from 'axios';
import * as cheerio from 'cheerio';
import {parse} from 'date-fns';
import {de} from 'date-fns/locale';
import {LocationMenu} from '../sharedModels';
import {addMenusToDb} from '../utils/db';
import {Location} from "../locations";

export async function parseMenu(date: Date): Promise<LocationMenu[]> {
  const { data: rawHtml } = await axios.get<string>('https://www.coop-restaurant.ch/de/menueseite.vst4221.restaurant.html');

  const dayToGet = date.getDay();
  const weekdaysFromNow = dayToGet - new Date().getDay();
  if (weekdaysFromNow < 0) {
    return [];
  }

  const document = cheerio.load(rawHtml);

  let weekdayIdentifiers: Record<number, string> = {};
  document('select#wochentag').each((index, data) => {
    weekdayIdentifiers = data
      .childNodes
      .filter(element => element.tagName === 'option')
      .map(element => ({
        value: element.attribs.value,
        text: element.childNodes[0].data ?? ''
      }))
      .filter(item => item.value.startsWith('weekday'))
      .map(item => {
        const parsedDate = parse(item.text, 'EEEE, dd.mm', new Date(), { locale: de });

        return {
          ...item,
          weekday: parsedDate.getDay()
        };
      })
      .reduce((result, value) => {
        result[value.weekday] = value.value;

        return result;
      }, {} as Record<number, string>);
  });

  const menus: LocationMenu[] = [];
  document(`#${weekdayIdentifiers[dayToGet]} > div > div > div`).each((index, data) => {
    const info = data.childNodes[1];
    const menuType = info.childNodes[1].childNodes[1].childNodes[1].attribs.alt;
    const price = info.childNodes[3].childNodes[1].childNodes[0].data?.trim();

    const menuDetails = data.childNodes[3].childNodes[1].childNodes?.filter(e => e.type === 'text')?.map(e => e.data?.trim()) ?? [];

    menus.push({
      name: menuType,
      price: price ? `CHF ${price}` : undefined,
      // @ts-ignore
      details: menuDetails.filter(item => item)
    });
  });

  await addMenusToDb(Location.CoopRestaurantLokwerk, date, menus);

  return menus;
}
