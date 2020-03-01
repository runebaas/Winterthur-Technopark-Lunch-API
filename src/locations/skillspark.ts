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
  const weeklyMenus = JSON.parse(Buffer.from(result).toString()) as Week;

  for (const day of [ weeklyMenus.montag, weeklyMenus.dienstag, weeklyMenus.mitwoch, weeklyMenus.donnerstag, weeklyMenus.freitag ]) {
    const dayDate = parse(day.tag, 'EEEE dd. LLLL yyyy', Date.now(), { locale: deLocale });
    const menus: LocationMenu[] = [
      {
        name: 'traditionell',
        details: day.traditionell
      },
      {
        name: 'vegetarisch',
        details: day.vegetarisch
      },
      {
        name: 'täglich',
        details: weeklyMenus.taglich
      }
    ];

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
