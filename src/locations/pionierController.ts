import { APIGatewayEvent } from 'aws-lambda';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { formatISO, parseISO } from 'date-fns';
import { ApiResponse } from '../api';
import { LocationMenu, LocationResponse } from '../sharedModels';
import { addMenusToDb, getMenusFromDb } from '../db';
import { Location, locationInformation } from '../locations';

async function parseMenu(date: Date, formattedDate: string): Promise<object[]> {
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

  const menus = Object
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

export async function getPionierMenu(event: APIGatewayEvent): Promise<ApiResponse<LocationResponse>> {
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

  let menus = await getMenusFromDb(Location.Pionier, date);

  const formattedDate = formatISO(date, { representation: 'date' });
  if (!menus) {
    menus = await parseMenu(date, formattedDate);
  }

  return {
    statusCode: 200,
    body: {
      name: locationInformation[Location.Pionier].name,
      date: formattedDate,
      menus: menus
    }
  };
}

type PionierResponse = {[name: string]: string[]};
