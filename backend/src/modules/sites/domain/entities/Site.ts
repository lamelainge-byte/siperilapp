// objeto de negocio de un sitio, no es la tabla: sitemodel es la tabla y siteadapter convierte entre los dos
export type Site = {
  id: string;
  name: string;
  company: string;
  address: string | null;
  area: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};
