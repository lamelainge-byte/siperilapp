// express, middlewares() prepara seguridad y json, routes() cuelga /api y al final el manejador de errores
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import type { AppContainer } from '../bootstrap/container.js';
import { AuthRoutes } from '../modules/auth/infrastructure/routes/AuthRoutes.js';
import { ReportRoutes } from '../modules/reports/infrastructure/routes/ReportRoutes.js';
import { SiteRoutes } from '../modules/sites/infrastructure/routes/SiteRoutes.js';
import { UserRoutes } from '../modules/users/infrastructure/routes/UserRoutes.js';
import { setupSwagger } from '../shared/config/swagger.js';
import { errorHandler } from '../shared/middleware/error-handler.js';

export class App {
  private readonly app: Application;

  constructor(private readonly container: AppContainer) {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    // cabeceras de seguridad, cors y tope de peticiones antes de las rutas
    this.app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    this.app.use(cors());
    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // ventana de 15 minutos
        limit: 300, // maximo de peticiones por ip en esa ventana
      }),
    );
    // las fotos de evidencia se sirven desde esta carpeta
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  }

  private routes(): void {
  this.app.get('/api/health', (_req, res) => {
    // prueba rapida de que el api esta vivo
    res.json({ status: 'ok', service: 'siperil-api' });
    });
    this.app.use('/api/auth', AuthRoutes(this.container.authUseCases));
    this.app.use('/api/reports', ReportRoutes(this.container.reportUseCases));
    this.app.use('/api/users', UserRoutes(this.container.userUseCases));
    this.app.use('/api/sites', SiteRoutes(this.container.siteUseCases));
    setupSwagger(this.app);
    // va al final para atrapar los errores de todas las rutas
    this.app.use(errorHandler);
  }

  getApp(): Application {
    return this.app;
  }
}
