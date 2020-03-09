import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';
import { LocationMenu } from '../sharedModels';
import { addMenusToDb, getMenusFromDb } from '../utils/db';
import { Location, ParserArguments } from '../locations';

export async function parseMenu(args: ParserArguments): Promise<LocationMenu[]> {
  const { date } = args;
  const { data: rawHtml } = await axios.get<string>('https://trichtersaal.sv-restaurant.ch/de/menuplan/');

  const document = cheerio.load(rawHtml);

  const dates: Record<string, Date> = {};
  document('[for^=\'mp-tab\']').each((index, data) => {
    const tabId = data.attribs.for?.replace('mp-', '');
    const unparsedDate = data.childNodes[3].childNodes[0].data ?? '';
    dates[tabId] = parse(unparsedDate, 'dd.MM.', new Date());
  });

  document('[id^=\'menu-plan-tab\']').each((index, data) => {
    const tabId = data.attribs.id?.replace('menu-plan-', '') ?? '';

    const menusElements = data.childNodes
      .flatMap(node => node.childNodes)
      .filter(node => node?.type === 'tag')
      .map(node => node.childNodes.filter(child => child?.type === 'tag'));

    const complete: LocationMenu[] = [];

    for (const menuElements of menusElements) {
      const menuData: LocationMenu = {
        name: '',
        price: '',
        details: []
      };

      menuData.name = menuElements[0]?.childNodes[0]?.data ?? '';
      const price = menuElements[4].childNodes[5].childNodes[1].childNodes[0]?.data;
      if (price) {
        menuData.price = `CHF ${price}`;
      }
      menuData.details.push(menuElements[1].childNodes[0]?.data ?? '');
      menuElements[3]
        .childNodes
        .filter(node => node.type === 'text')
        .map(node => node.data?.trim())
        .join(' ')
        .split('   ')
        .forEach(item => menuData.details.push(item));

      complete.push(menuData);
    }
    addMenusToDb(Location.CafeteriaTrichtersaal, dates[tabId], complete);
  });

  return await getMenusFromDb(Location.CafeteriaTrichtersaal, date) ?? [];
}
