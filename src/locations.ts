import { LocationMenu, WeekDay } from './sharedModels';
import { parseMenu as ThaiWaegeliMenu } from './locations/thaiWaegeli';
import { parseMenu as LoStivaleMenu } from './locations/loStivale';

// These are used as the database key, do not change!
export enum Location {
  Pionier = 'pionier',
  Skillspark = 'skillspark',
  EurestCafeteria = 'eurestCafeteria',
  CoopRestaurantLokwerk = 'coopRestaurantLokwerk',
  CafeteriaTrichtersaal = 'cafeteriaTrichtersaal',
  ThaiWaegeli = 'thaiWaegeli',
  LoStivale = 'loStivale'
}

export const locationInformation: Record<Location, LocationMeta> = {
  [Location.ThaiWaegeli]: {
    endpoint: '/location/thai-waegeli',
    dynamic: false,
    getParser: (): ParserFunction => ThaiWaegeliMenu,
    parserParameters: {},
    days: [ WeekDay.Thursday ],
    info: {
      name: 'Thai Wägeli',
      website: 'https://www.thai-waegeli.ch'
    }
  },
  [Location.LoStivale]: {
    endpoint: '/location/lo-stivale',
    dynamic: false,
    getParser: (): ParserFunction => LoStivaleMenu,
    parserParameters: {},
    days: [ WeekDay.Monday ],
    info: {
      name: 'Lo Stivale (Pizza Wagen)',
      website: 'https://www.lostivale.ch/web/index.php'
    }
  },
  [Location.Pionier]: {
    endpoint: '/location/pionier',
    dynamic: true,
    getParser: async (): ParserFunctionAsync => (await import(/* webpackChunkName: "pionierParser" */'./locations/pionier')).parseMenu,
    parserParameters: {},
    days: [ WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday ],
    info: {
      name: 'Kantine Pionier (AXA)',
      website: 'https://zfv.ch/de/microsites/restaurant-pionier/ueber-uns'
    }
  },
  [Location.Skillspark]: {
    endpoint: '/location/skillspark',
    dynamic: true,
    getParser: async (): ParserFunctionAsync => (await import(/* webpackChunkName: "skillsparkParser" */'./locations/skillspark')).parseMenu,
    parserParameters: {},
    days: [ WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday ],
    info: {
      name: 'Kantine Skills Park',
      website: 'https://skillspark.ch/index.php'
    }
  },
  [Location.EurestCafeteria]: {
    endpoint: '/location/eurest-cafeteria',
    dynamic: true,
    getParser: async (): ParserFunctionAsync => (await import(/* webpackChunkName: "eurestCafeteriaParser" */'./locations/eurestCafeteria')).parseMenu,
    parserParameters: {},
    days: [ WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday ],
    info: {
      name: 'Eurest Cafeteria Technopark',
      website: 'https://tpw.ch/angebot/essen-trinken/'
    }
  },
  [Location.CafeteriaTrichtersaal]: {
    endpoint: '/location/cafeteria-trichtersaal',
    dynamic: true,
    getParser: async (): ParserFunctionAsync => (await import(/* webpackChunkName: "cafeteriaTrichtersaalParser" */'./locations/cafeteriaTrichtersaal')).parseMenu,
    parserParameters: {},
    days: [ WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday ],
    info: {
      name: 'Cafeteria Trichtersaal',
      website: 'https://trichtersaal.sv-restaurant.ch/de/menuplan/'
    }
  },
  [Location.CoopRestaurantLokwerk]: {
    endpoint: '/location/coop-restaurant-lokwerk',
    dynamic: true,
    getParser: async (): ParserFunctionAsync => (await import(/* webpackChunkName: "coopRestaurantLokwerkParser" */'./locations/coopRestaurantLokwerk')).parseMenu,
    parserParameters: {},
    days: [ WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday, WeekDay.Saturday ],
    info: {
      name: 'Coop Restaurant Lokwerk',
      website: 'https://www.coop-restaurant.ch/de/menueseite.vst4221.restaurant.html'
    }
  }
};

type ParserParameters = Record<string, unknown>;
type ParserFunctionAsync = Promise<(args: ParserArguments) => Promise<LocationMenu[]>>;
type ParserFunction = (args: ParserArguments) => LocationMenu[];

export interface LocationMeta {
  endpoint: string;
  dynamic: boolean;
  getParser: () => (ParserFunctionAsync|ParserFunction);
  parserParameters: ParserParameters;
  days: WeekDay[];
  info: LocationInformation;
}

export interface ParserArguments {
  date: Date;
  formattedDate: string;
  parameters: ParserParameters;
}

export interface LocationInformation {
  name: string;
  website: string;
}
