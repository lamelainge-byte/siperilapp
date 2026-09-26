import { Router } from 'express';
import { requireAuth, requireRole } from '../../../../shared/middleware/auth.middleware.js';
import type { SiteUseCases } from '../../application/SiteUseCases.js';
import { SiteController } from '../controllers/SiteController.js';

export function SiteRoutes(useCases: SiteUseCases) {
  const router = Router();
  const controller = new SiteController(useCases);
  router.use(requireAuth);
  router.get('/', controller.list);
  router.get('/:id', controller.getOne);
  // crear, editar y borrar sitios queda solo para el admin
  router.post('/', requireRole('admin'), controller.create);
  router.put('/:id', requireRole('admin'), controller.update);
  router.delete('/:id', requireRole('admin'), controller.remove);
  return router;
}
