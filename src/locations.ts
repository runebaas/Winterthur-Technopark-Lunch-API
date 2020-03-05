import { LocationMenu, WeekDay } from './sharedModels';
import { parseMenu as ThaiWaegeliMenu } from './locations/thaiWaegeli';

// These are used as the database key, do not change!
export enum Location {
  Pionier = 'pionier',
  Skillspark = 'skillspark',
  EurestCafeteria = 'eurestCafeteria',
  ThaiWaegeli = 'thaiWaegeli'
}

export const locationInformation: Record<Location, LocationMeta> = {
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
  [Location.ThaiWaegeli]: {
    endpoint: '/location/thai-waegeli',
    dynamic: false,
    getParser: (): ParserFunction => ThaiWaegeliMenu,
    days: [ WeekDay.Thursday ],
    info: {
      name: 'Thai Wägeli',
      website: 'https://www.thai-waegeli.ch'
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
