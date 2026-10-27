import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../../../../shared/middleware/auth.middleware.js';
import type { ReportUseCases } from '../../application/ReportUseCases.js';
import type { ReportImagePort } from '../../domain/ports/ReportImagePort.js';
import { ReportController } from '../controllers/ReportController.js';

const upload = multer({
  // la evidencia queda en memoria y el controlador la guarda en la base
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // tope de 5 mb por evidencia
  fileFilter: (_req, file, cb) => {
    // rechaza pdf u otros archivos que no sean imagen
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Solo se permiten imágenes'));
      return;
    }
    cb(null, true);
  },
});

export function ReportRoutes(useCases: ReportUseCases, images: ReportImagePort) {
  const router = Router();
  const controller = new ReportController(useCases, images);
  router.use(requireAuth);
  router.get('/', controller.list);
  // conteos y resolver un reporte son solo de administrador
  router.get('/stats', requireRole('admin'), controller.stats);
  router.get('/:id', controller.getOne);
  router.post('/', upload.single('image'), controller.create);
  router.put('/:id', upload.single('image'), controller.update);
  router.delete('/:id', controller.remove);
  router.patch('/:id/resolve', requireRole('admin'), controller.resolve);
  return router;
}
