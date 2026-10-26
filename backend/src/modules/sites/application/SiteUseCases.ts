// paquete de sitios, listar y ver los usa cualquier usuario logueado, crear, editar y borrar son de admin
import type { CreateSite } from './use-cases/CreateSite.js';
import type { DeleteSite } from './use-cases/DeleteSite.js';
import type { GetSite } from './use-cases/GetSite.js';
import type { ListSites } from './use-cases/ListSites.js';
import type { UpdateSite } from './use-cases/UpdateSite.js';

export type SiteUseCases = {
  listSites: ListSites;
  getSite: GetSite;
  createSite: CreateSite;
  updateSite: UpdateSite;
  deleteSite: DeleteSite;
};
