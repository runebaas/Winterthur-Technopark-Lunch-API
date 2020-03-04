import { LocationMenu } from './sharedModels';

// These are used as the database key, do not change!
export enum Location {
  Pionier = 'pionier',
  Skillspark = 'skillspark',
  EurestCafeteria = 'eurestCafeteria'
}

export const locationInformation: Record<Location, LocationMeta> = {
  [Location.Pionier]: {
    endpoint: '/location/pionier',
    getParser: async () => (await import(/* webpackChunkName: "pionierParser" */'./locations/pionier')).parseMenu,
    info: {
      name: 'Kantine Pionier (AXA)',
      website: 'https://zfv.ch/de/microsites/restaurant-pionier/ueber-uns'
    }
  },
  [Location.Skillspark]: {
    endpoint: '/location/skillspark',
    getParser: async () => (await import(/* webpackChunkName: "skillsparkParser" */'./locations/skillspark')).parseMenu,
    info: {
      name: 'Kantine Skills Park',
      website: 'https://skillspark.ch/index.php'
    }
  },
  [Location.EurestCafeteria]: {
    endpoint: '/location/eurest-cafeteria',
    getParser: async () => (await import(/* webpackChunkName: "eurestCafeteriaParser" */'./locations/eurestCafeteria')).parseMenu,
    info: {
      name: 'Eurest Cafeteria Technopark',
      website: 'https://tpw.ch/angebot/essen-trinken/'
    }
  }
};

export interface LocationMeta {
  endpoint: string;
  getParser: () => Promise<(date: Date, formattedDate: string) => Promise<LocationMenu[]>>;
  info: LocationInformation;
}

export interface LocationInformation {
  name: string;
  website: string;
}
