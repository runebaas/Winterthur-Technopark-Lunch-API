import { APIGatewayEvent } from 'aws-lambda';
import { parseISO } from 'date-fns';
import { locationInformation, LocationInformation } from '../locations';
import { ApiResponse } from '../utils/api';

export function getLocationOverview(event: APIGatewayEvent): ApiResponse<OverviewResponse> {
  const showAll = (typeof event.queryStringParameters?.all === 'string');
  const date = event.queryStringParameters?.date ? parseISO(event.queryStringParameters.date) : new Date();

  return {
    statusCode: 200,
    body: {
      locations: Object.entries(locationInformation).reduce((result, [ key, data ]) => {
        if (data.days.includes(date.getDay()) || showAll) {
          let href = `https://${event.headers.Host}${data.endpoint}`;
          if (event.queryStringParameters?.date) {
            href += `?date=${event.queryStringParameters.date}`;
          }

          result[key] = {
            href: href,
            details: {
              ...data.info,
              openOn: data.days
            }
          };
        }

        return result;
      }, {} as MappedLocationObj)
    }
  };
}

interface OverviewResponse {
  locations: MappedLocationObj;
}

interface MappedLocation {
  href: string;
  details: MappedLocationDetails;
}

interface MappedLocationDetails extends LocationInformation {
  openOn: number[];
}

type MappedLocationObj = Record<string, MappedLocation>;
