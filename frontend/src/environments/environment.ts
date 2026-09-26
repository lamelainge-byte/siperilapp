import { apiUrl } from './api';

export const environment = {
  production: false,
  // la url se arma al vuelo segun si es navegador, emulador o celular
  get apiUrl(): string {
    return apiUrl();
  },
};
