import { Router } from 'express';
import { requireAuth } from '../../../../shared/middleware/auth.middleware.js';
import type { AuthUseCases } from '../../application/AuthUseCases.js';
import { AuthController } from '../controllers/AuthController.js';

export function AuthRoutes(useCases: AuthUseCases) {
  const router = Router();
  const controller = new AuthController(useCases);
  // registro, login y refresh son publicos
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/refresh', controller.refresh);
  // cerrar sesion y ver el perfil exigen access token
  router.post('/logout', requireAuth, controller.logout);
  router.get('/me', requireAuth, controller.me);
  return router;
}
