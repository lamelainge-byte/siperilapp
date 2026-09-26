import type { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'SIPERIL API',
    version: '1.0.0',
    description:
      'API REST hexagonal por módulos (puertos y adaptadores), TypeORM, PostgreSQL, Joi, JWT y CORS.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/api/health': { get: { summary: 'Salud del servicio', responses: { '200': { description: 'OK' } } } },
    '/api/auth/register': { post: { summary: 'Registro de trabajador', responses: { '201': { description: 'Creado' } } } },
    '/api/auth/login': { post: { summary: 'Inicio de sesión JWT', responses: { '200': { description: 'Tokens + usuario' } } } },
    '/api/auth/refresh': { post: { summary: 'Renovar access token', responses: { '200': { description: 'Nuevos tokens' } } } },
    '/api/auth/logout': { post: { security: [{ bearerAuth: [] }], summary: 'Cerrar sesión', responses: { '200': { description: 'OK' } } } },
    '/api/auth/me': { get: { security: [{ bearerAuth: [] }], summary: 'Perfil actual', responses: { '200': { description: 'Usuario' } } } },
    '/api/reports': {
      get: { security: [{ bearerAuth: [] }], summary: 'Listar reportes', responses: { '200': { description: 'Lista' } } },
      post: { security: [{ bearerAuth: [] }], summary: 'Crear reporte', responses: { '201': { description: 'Creado' } } },
    },
    '/api/reports/stats': { get: { security: [{ bearerAuth: [] }], summary: 'Contadores (admin)', responses: { '200': { description: 'Stats' } } } },
    '/api/reports/{id}': {
      get: { security: [{ bearerAuth: [] }], summary: 'Detalle', responses: { '200': { description: 'OK' } } },
      put: { security: [{ bearerAuth: [] }], summary: 'Actualizar', responses: { '200': { description: 'OK' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Eliminar', responses: { '204': { description: 'OK' } } },
    },
    '/api/reports/{id}/resolve': { patch: { security: [{ bearerAuth: [] }], summary: 'Marcar resuelto (admin)', responses: { '200': { description: 'OK' } } } },
    '/api/users': {
      get: { security: [{ bearerAuth: [] }], summary: 'Listar usuarios (admin)', responses: { '200': { description: 'Lista' } } },
      post: { security: [{ bearerAuth: [] }], summary: 'Crear usuario (admin)', responses: { '201': { description: 'Creado' } } },
    },
    '/api/users/{id}': {
      get: { security: [{ bearerAuth: [] }], summary: 'Detalle de usuario', responses: { '200': { description: 'OK' } } },
      put: { security: [{ bearerAuth: [] }], summary: 'Actualizar (admin)', responses: { '200': { description: 'OK' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Baja lógica (admin)', responses: { '204': { description: 'OK' } } },
    },
    '/api/sites': {
      get: { security: [{ bearerAuth: [] }], summary: 'Listar sitios', responses: { '200': { description: 'Lista' } } },
      post: { security: [{ bearerAuth: [] }], summary: 'Crear sitio (admin)', responses: { '201': { description: 'Creado' } } },
    },
    '/api/sites/{id}': {
      get: { security: [{ bearerAuth: [] }], summary: 'Detalle de sitio', responses: { '200': { description: 'OK' } } },
      put: { security: [{ bearerAuth: [] }], summary: 'Actualizar (admin)', responses: { '200': { description: 'OK' } } },
      delete: { security: [{ bearerAuth: [] }], summary: 'Eliminar (admin)', responses: { '204': { description: 'OK' } } },
    },
  },
};

export function setupSwagger(app: Application) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
