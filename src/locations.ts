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
    days: [ WeekDay.Monday, WeekDay.Tuesday, WeekDay.Wednesday, WeekDay.Thursday, WeekDay.Friday, WeekDay.Saturday ],
    info: {
      name: 'Coop Restaurant Lokwerk',
      website: 'https://www.coop-restaurant.ch/de/menueseite.vst4221.restaurant.html'
    }
  }
};

export interface LocationMeta {
  endpoint: string;
  dynamic: boolean;
  getParser: () => (ParserFunctionAsync|ParserFunction);
  days: WeekDay[];
  info: LocationInformation;
}

type ParserFunctionAsync = Promise<(date: Date, formattedDate: string) => Promise<LocationMenu[]>>;
type ParserFunction = (date: Date, formattedDate: string) => LocationMenu[];

export interface LocationInformation {
  name: string;
  website: string;
}
