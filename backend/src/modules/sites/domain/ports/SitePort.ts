// contrato de sitios, countreports sirve para impedir borrar un sitio que ya tiene incidentes
import type { Site } from '../entities/Site.js';

export type NewSite = {
  name: string;
  company: string;
  address: string | null;
  area: string | null;
  active: boolean;
};

export type SiteUpdates = Partial<NewSite>;

export interface SitePort {
  list(company?: string): Promise<Site[]>;
  findById(id: string): Promise<Site | null>;
  create(data: NewSite): Promise<Site>;
  update(id: string, data: SiteUpdates): Promise<Site>;
  delete(id: string): Promise<void>;
  countReports(siteId: string): Promise<number>;
}
