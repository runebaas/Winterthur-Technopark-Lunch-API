import { Api } from './api';
import { getPionierMenu } from './locations/pionierController';
import { getSkillsparkMenu } from './locations/skillsparkController';
import { loadWasm } from './wasmLoader';
import { LocationDescription } from './sharedModels';

const api = new Api({});

const locations: Record<string, LocationDescription> = {
  'Kantine Pionier (AXA)': {
    path: '/location/pionier',
    controller: getPionierMenu
  },
  'Skills Park': {
    path: '/location/skillspark',
    controller: getSkillsparkMenu
  }
};

Object.values(locations).forEach(loc => api.get(loc.path, loc.controller));

api.get('/location', event => ({
  statusCode: 200,
  body: {
    locations: Object.fromEntries(Object.entries(locations).map(([ name, loc ]) => ([ name, `https://${event.headers.Host}${loc.path}` ])))
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
