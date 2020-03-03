import axios from 'axios';
import { parse } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import { LocationMenu } from '../sharedModels';
import { loadWasm } from '../utils/wasmLoader';
import { addMenusToDb, getMenusFromDb } from '../utils/db';
import { Location } from '../locations';

export async function parseMenu(date: Date): Promise<LocationMenu[]> {
  const { parseSkillsparkPdf } = await loadWasm();

  const docBuffer = await axios.get<ArrayBuffer>('https://skillspark.ch/images/menu.pdf', { responseType: 'arraybuffer' });

  const result = await parseSkillsparkPdf(new Uint8Array(docBuffer.data));
  const weeklyMenus = JSON.parse(result) as Week;

  const daily: LocationMenu[] = [];
  for (const item of weeklyMenus.taglich) {
    const itemRegexResult = item.match(/(?<name>.+)\s(?<price>CHF\s*\d+.\d+)/);
    if(!itemRegexResult?.groups) {
      continue;
    }
    daily.push({
      name: itemRegexResult.groups.name,
      price: itemRegexResult.groups.price,
      details: []
    })
  }

  for (const day of [ weeklyMenus.montag, weeklyMenus.dienstag, weeklyMenus.mitwoch, weeklyMenus.donnerstag, weeklyMenus.freitag ]) {
    const dayDate = parse(day.tag, 'EEEE dd. LLLL yyyy', Date.now(), { locale: deLocale });
    const menus: LocationMenu[] = []

    for (const menu of [day.traditionell, day.vegetarisch]) {
      const [info, ...details] = menu;
      const splitInfo = info.match(/(?<name>.+)\s(?<price>CHF\s*\d+.\d+)/);
      if (splitInfo?.groups) {
        menus.push({
          name: splitInfo.groups.name,
          price: splitInfo.groups.price,
          details: details
        })
      } else {
        menus.push({
          name: info,
          details: details
        })
      }
    }

    menus.push(...daily);

    await addMenusToDb(Location.Skillspark, dayDate, menus);
  }

  return await getMenusFromDb(Location.Skillspark, date) ?? [];
}

interface Week {
  montag: Day;
  dienstag: Day;
  mitwoch: Day;
  donnerstag: Day;
  freitag: Day;
  taglich: string[];
  unknown: string[];
}

interface Day {
  tag: string;
  traditionell: string[];
  vegetarisch: string[];
}
