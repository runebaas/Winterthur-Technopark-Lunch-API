import { ApiRequest } from './api';

export interface LocationResponse {
  name: string;
  date: string;
  menus: LocationMenu[];
}

export interface LocationMenu {
  name: string;
  price: string;
  details: string[];
}

export interface LocationDescription {
  path: string;
  controller: ApiRequest;
}
