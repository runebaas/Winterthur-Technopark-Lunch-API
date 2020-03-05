import { APIGatewayEvent } from 'aws-lambda';
import { formatISO, parseISO } from 'date-fns';
import { ApiResponse } from '../utils/api';
import { LocationResponse } from '../sharedModels';
import { getMenusFromDb } from '../utils/db';
import { Location, LocationMeta } from '../locations';

export class LocationsController {
  private readonly locations: Record<Location, LocationMeta>;

  constructor(locations: Record<Location, LocationMeta>) {
    this.locations = locations;
  }

  async getMenuForLocation(location: Location, event: APIGatewayEvent): Promise<ApiResponse<LocationResponse>> {
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

    const locationData = this.locations[location];
    const formattedDate = formatISO(date, { representation: 'date' });
    let menus;

    if (locationData.dynamic && !(typeof event.queryStringParameters?.update === 'string')) {
      menus = await getMenusFromDb(location, date);
    }

    if (!menus) {
      const parser = await locationData.getParser();
      menus = await parser(date, formattedDate);
    }

    return {
      statusCode: 200,
      body: {
        name: locationData.info.name,
        date: formattedDate,
        menus: menus
      }
    };
  }
}
