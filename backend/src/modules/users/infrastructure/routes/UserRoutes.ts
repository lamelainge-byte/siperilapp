import { Router } from 'express';
import { requireAuth, requireRole } from '../../../../shared/middleware/auth.middleware.js';
import type { UserUseCases } from '../../application/UserUseCases.js';
import { UserController } from '../controllers/UserController.js';

export function UserRoutes(useCases: UserUseCases) {
  const router = Router();
  const controller = new UserController(useCases);
  // todo el modulo exige sesion y el crud de usuarios es solo admin
  router.use(requireAuth);
  router.get('/', requireRole('admin'), controller.getAllUsers);
  router.get('/:id', controller.getUserById);
  router.post('/', requireRole('admin'), controller.createUser);
  router.put('/:id', requireRole('admin'), controller.updateUser);
  router.delete('/:id', requireRole('admin'), controller.deleteUser);
  return router;
}
