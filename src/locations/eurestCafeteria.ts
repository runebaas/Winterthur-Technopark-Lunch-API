import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse, formatISO } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import { LocationMenu } from '../sharedModels';
import { loadWasm } from '../utils/wasmLoader';
import { addMenusToDb, getMenusFromDb } from '../utils/db';
import { Location, ParserArguments } from '../locations';

async function findPdf(): Promise<string> {
  const sourcePage = 'https://tpw.ch/angebot/essen-trinken/';

  const sourcePageContent = await axios.get(sourcePage);
  const document = cheerio.load(sourcePageContent.data.toString());

  return document('a[target="_blank"]')
    .filter((index, element) => !Boolean(element.data))
    .attr('href') ?? '';
}

export async function parseMenu(args: ParserArguments): Promise<LocationMenu[]> {
  const { date } = args;
  const pdfUrl = await findPdf();
  if (!pdfUrl) {
    return [];
  }

  const { parseEurestCafeteriaPdf } = await loadWasm();

  const docBuffer = await axios.get<ArrayBuffer>(pdfUrl, { responseType: 'arraybuffer' });

  const result = await parseEurestCafeteriaPdf(new Uint8Array(docBuffer.data));
  const weeklyMenus = JSON.parse(result) as Week;

  const menuOrderResult = weeklyMenus.menuOrder?.matchAll(/(?<name>Tageshit\s*|Menü\s*|Vegi\s*)(?<price>(pro\s*100\s*gr\s*)?CHF\s*\d+,\d+)/gu);
  const menuOrder = [ ...menuOrderResult ];

  const res: Record<string, LocationMenu[]> = {};
  for (const day of [ weeklyMenus.montag, weeklyMenus.dienstag, weeklyMenus.mitwoch, weeklyMenus.donnerstag, weeklyMenus.freitag ]) {
    if (!day.tag) {
      continue;
    }
    const dayDate = parse(day.tag, 'EEEE d. LLLL', Date.now(), { locale: deLocale });
    const menus: LocationMenu[] = [];

    for (const orderId in menuOrder) {
      const { groups } = menuOrder[orderId];
      if (!groups) {
        continue;
      }
      menus.push({
        name: groups.name,
        price: groups.price,
        details: day.menus[orderId]
      });
    }

    const formattedDayDate = formatISO(dayDate, { representation: 'date' });
    res[formattedDayDate] = menus;

    await addMenusToDb(Location.EurestCafeteria, dayDate, menus);
  }

  return await getMenusFromDb(Location.EurestCafeteria, date) ?? [];
}

interface Week {
  montag: Day;
  dienstag: Day;
  mitwoch: Day;
  donnerstag: Day;
  freitag: Day;
  menuOrder: string;
  unknown: string[];
}

interface Day {
  tag: string;
  menus: string[][];
  extra: string[];
}
