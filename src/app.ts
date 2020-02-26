import { Api, ApiRequest } from './api';
import { getPionierMenu } from './locations/pionierController';

const api = new Api({});

const locations: Record<string, ApiRequest> = {
  '/pionier': getPionierMenu
  // '/kantine-technopark': getKantineTechnoparkMenu,
  // '/skills-park': getSkillspark
};

Object.entries(locations).forEach(([ location, controller ]) => api.get(location, controller));

api.get('locations', () => ({
  statusCode: 200,
  body: Object.keys(locations)
}));

// eslint-disable-next-line prefer-destructuring
export const handler = api.handler;
