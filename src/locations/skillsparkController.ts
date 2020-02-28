import { APIGatewayEvent } from 'aws-lambda';
import axios from 'axios';
import { formatISO, parse, parseISO } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import { ApiResponse } from '../api';
import { LocationResponse } from '../sharedModels';
import { loadWasm } from '../wasmLoader';
import { addMenusToDb, getMenusFromDb } from '../db';
import { Location, locationInformation } from '../locations';

async function parseMenu(date: Date): Promise<object[]> {
  const { parseSkillsparkPdf } = await loadWasm();

  const docBuffer = await axios.get<ArrayBuffer>('https://skillspark.ch/images/menu.pdf', { responseType: 'arraybuffer' });

  const result = await parseSkillsparkPdf(new Uint8Array(docBuffer.data));
  const weeklyMenus = JSON.parse(Buffer.from(result).toString()) as Week;

  for (const day of [ weeklyMenus.montag, weeklyMenus.dienstag, weeklyMenus.mitwoch, weeklyMenus.donnerstag, weeklyMenus.freitag ]) {
    const dayDate = parse(day.tag, 'EEEE dd. LLLL yyyy', Date.now(), { locale: deLocale });
    const menus = [
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

export async function getSkillsparkMenu(event: APIGatewayEvent): Promise<ApiResponse<LocationResponse>> {
  const dateParam = event.queryStringParameters?.date;
  let date: Date;
  if (dateParam) {
    try {
      date = parseISO(dateParam);
    } catch {
      return {
        statusCode: 400,
        body: {
          message: 'Query Parameter "date" must have the following format: YYYY-MM-DD'
        }
      };
    }
  } else {
    date = new Date();
  }

  let menus = await getMenusFromDb(Location.Skillspark, date);

  const formattedDate = formatISO(date, { representation: 'date' });
  if (!menus) {
    menus = await parseMenu(date);
  }

  return {
    statusCode: 200,
    body: {
      name: locationInformation[Location.Skillspark].name,
      date: formattedDate,
      menus: menus
    }
  };
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
