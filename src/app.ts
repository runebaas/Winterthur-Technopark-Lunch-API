import { Api, ApiRequest } from './api';
import { getPionierMenu } from './locations/pionierController';
import { getSkillsparkMenu } from './locations/skillsparkController';
import { loadWasm } from './wasmLoader';
import { locationInformation, Location } from './locations';
import { LocationResponse } from './sharedModels';

const api = new Api({});

const locations: Record<string, { controller: ApiRequest<LocationResponse>; locationKey: Location }> = {
  '/location/pionier': {
    locationKey: Location.Pionier,
    controller: getPionierMenu
  },
  '/location/skillspark': {
    locationKey: Location.Skillspark,
    controller: getSkillsparkMenu
  }
};

Object.entries(locations).forEach(([ path, { controller } ]) => api.get(path, controller));

api.get('/location', event => ({
  statusCode: 200,
  body: {
    locations: Object.entries(locations).reduce((result, [ path, { locationKey } ]) => {
      result[locationKey] = {
        href: `https://${event.headers.Host}${path}`,
        details: locationInformation[locationKey]
      };

      return result;
    }, {} as any)
  }
}));

api.get('/wasm', async () => {
  const wasm = await loadWasm();
  const response = wasm.stuff('test');

  return {
    statusCode: 200,
    body: {
      message: response
    }
  };
});

// eslint-disable-next-line prefer-destructuring
export const handler = api.handler;
