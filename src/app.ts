import { Api } from './utils/api';
import { locationInformation, Location } from './locations';
import { LocationsController } from './controllers/locationsController';
import { getLocationOverview } from './controllers/overviewController';

const api = new Api({
  defaultHeaders: {
    'Access-Control-Allow-Origin': '*'
  }
});

const locationsController = new LocationsController(locationInformation);

Object.entries(locationInformation).forEach(([ key, data ]) => api.get(data.endpoint, event => locationsController.getMenuForLocation(key as Location, event)));

api.get('/location', event => getLocationOverview(event));

// eslint-disable-next-line prefer-destructuring
export const handler = api.handler;
