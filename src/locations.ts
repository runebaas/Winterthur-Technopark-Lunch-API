// These are used as the database key, do not change!
export enum Location {
  Pionier = 'pionier',
  Skillspark = 'skillspark'
}

export const locationInformation: Record<Location, LocationInformation> = {
  [Location.Pionier]: {
    name: 'Kantine Pionier (AXA)',
    website: 'https://zfv.ch/de/microsites/restaurant-pionier/ueber-uns'
  },
  [Location.Skillspark]: {
    name: 'Kantine Skills Park',
    website: 'https://skillspark.ch/index.php'
  }
};

export interface LocationInformation {
  name: string;
  website: string;
}
