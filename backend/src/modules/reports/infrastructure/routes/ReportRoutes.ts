import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireRole } from '../../../../shared/middleware/auth.middleware.js';
import type { ReportUseCases } from '../../application/ReportUseCases.js';
import { ReportController } from '../controllers/ReportController.js';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  // guarda la evidencia en disco con nombre unico y solo acepta imagenes
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
  }),
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

export function ReportRoutes(useCases: ReportUseCases) {
  const router = Router();
  const controller = new ReportController(useCases);
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
