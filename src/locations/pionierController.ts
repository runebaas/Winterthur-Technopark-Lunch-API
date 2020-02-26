import { URL } from 'url';
import { APIGatewayEvent } from 'aws-lambda';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ApiResponse } from '../api';
import { LocationMenu, LocationResponse } from '../sharedModels';

function getTodaysDate(): string {
  const now = new Date();

  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString()
    .padStart(2, '0')}`;
}

export async function getPionierMenu(event: APIGatewayEvent): Promise<ApiResponse<LocationResponse>> {
  const date = new URL(event.path, 'http://localhost').searchParams.get('date') || getTodaysDate();
  const res = await axios.get('https://zfv.ch/de/microsites/restaurant-pionier/menueplan');

  // todo: cheerio loads super slow on lambda, possibly cache the response in dynamodb?
  const document = cheerio.load(res.data);

  const resp: PionierResponse = {};
  document(`tr[data-date="${date}"]`).each((index, data) => {
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

  return {
    statusCode: 200,
    body: {
      name: 'Pionier (AXA)',
      date: date,
      menus: menus
    }
  };
}

type PionierResponse = {[name: string]: string[]};
