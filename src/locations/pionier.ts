import axios from 'axios';
import * as cheerio from 'cheerio';
import { LocationMenu } from '../sharedModels';
import { addMenusToDb } from '../utils/db';
import { Location } from '../locations';

export async function parseMenu(date: Date, formattedDate: string): Promise<LocationMenu[]> {
  const res = await axios.get('https://zfv.ch/de/microsites/restaurant-pionier/menueplan');

  const document = cheerio.load(res.data);

  const resp: PionierResponse = {};
  document(`tr[data-date="${formattedDate}"]`).each((index, data) => {
    const name = data.childNodes[1]?.childNodes[0]?.data?.trim() ?? index;
    const menuElement = data.childNodes[3]?.childNodes[1]?.childNodes ?? [ { type: 'tag' } ];
    resp[name] = menuElement
      .filter(element => element.type !== 'tag')
      .map(element => element.data?.trim() ?? '')
      .filter(element => element !== '');
  });

  const menus: LocationMenu[] = Object
    .entries(resp)
    .map(([ name, details ]): LocationMenu => {
      const [ price ] = details.splice(-1);

      return {
        name,
        price,
        details
      };
    })
    .filter(menu => menu.name.toLowerCase() !== 'news');

  await addMenusToDb(Location.Pionier, date, menus);

  return menus;
}

type PionierResponse = {[name: string]: string[]};
