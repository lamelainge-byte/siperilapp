# Evidencia Postman

Fecha: 2026-09-15

Backend: `http://localhost:3000`

| Caso | Método | Ruta | Código esperado | Código obtenido | Notas |
| --- | --- | --- | --- | --- | --- |
| Salud | GET | /api/health | 200 | 200 | `status: ok` |
| Registro | POST | /api/auth/register | 201 | 201 | Usuario de prueba E2E |
| Login | POST | /api/auth/login | 200 | 200 | Admin `admin@siperil.local` y worker `ana@empresa.com` |
| Me | GET | /api/auth/me | 200 | 200 | Bearer |
| Crear reporte | POST | /api/reports | 201 | 201 | También verificado desde la app Ionic |
| Listar | GET | /api/reports | 200 | 200 | |
| Actualizar | PUT | /api/reports/:id | 200 | 200 | |
| Stats admin | GET | /api/reports/stats | 200 | 200 | Login admin |
| Resolver | PATCH | /api/reports/:id/resolve | 200 | 200 | |
| Logout | POST | /api/auth/logout | 200 | 200 | Revoca refresh |
| Sin token | GET | /api/reports | 401 | 401 | |

Adjunta capturas de Postman o de Swagger (`/api/docs`) junto a este archivo para la entrega.
