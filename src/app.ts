import { Api } from './utils/api';
import { loadWasm } from './utils/wasmLoader';
import { locationInformation, Location } from './locations';
import { LocationsController } from './controllers/locationsController';

const api = new Api({});

const locationsController = new LocationsController(locationInformation);

Object.entries(locationInformation).forEach(([ key, data ]) => api.get(data.endpoint, event => locationsController.getMenuForLocation(key as Location, event)));

api.get('/location', event => ({
  statusCode: 200,
  body: {
    locations: Object.entries(locationInformation).reduce((result, [ key, data ]) => {
      result[key] = {
        href: `https://${event.headers.Host}${data.endpoint}`,
        details: data.info
      };

      return result;
    }, {} as any)
  }
}));

// eslint-disable-next-line prefer-destructuring
export const handler = api.handler;
