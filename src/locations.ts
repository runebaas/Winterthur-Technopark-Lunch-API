import { LocationMenu } from './sharedModels';
import { parseMenu as parseSkillsparkMenu } from './locations/skillspark';
import { parseMenu as parsePionierMenu } from './locations/pionier';

// These are used as the database key, do not change!
export enum Location {
  Pionier = 'pionier',
  Skillspark = 'skillspark'
}

export const locationInformation: Record<Location, LocationMeta> = {
  [Location.Pionier]: {
    endpoint: '/location/pionier',
    parser: parsePionierMenu,
    info: {
      name: 'Kantine Pionier (AXA)',
      website: 'https://zfv.ch/de/microsites/restaurant-pionier/ueber-uns'
    }
  },
  [Location.Skillspark]: {
    endpoint: '/location/skillspark',
    parser: parseSkillsparkMenu,
    info: {
      name: 'Kantine Skills Park',
      website: 'https://skillspark.ch/index.php'
    }
  }
};

export interface LocationMeta {
  endpoint: string;
  parser: (date: Date, formattedDate: string) => Promise<LocationMenu[]>;
  info: LocationInformation;
}

export interface LocationInformation {
  name: string;
  website: string;
}
