# SIPERIL híbrido (Angular + Ionic + Capacitor + API REST)

App académica de **Electiva II – Aplicaciones Híbridas**: reportes de seguridad industrial (migración del proyecto Flutter). El cliente **no habla con Firestore**; consume una API REST propia. PostgreSQL es la base principal. Firebase **no** forma parte del flujo nuevo.

## Qué incluye

- Splash, login/registro, menú, 4 tipos de reporte, CRUD, panel admin.
- JWT (access + refresh con revocación al logout), guards e interceptores.
- Persistencia con **TypeORM** + PostgreSQL (sin Prisma).
- Cámara y geolocalización (Capacitor) + caché SQLite local.
- Servicio externo: **OpenWeatherMap** (clima en el punto del incidente). **EmailJS** opcional en el backend (el mismo correo de notificación que Flutter, con claves solo en `.env`).
- Accesibilidad: tamaño de fuente y alto contraste.

## Estructura de ramas sugerida

- `main`: entregable estable.
- `develop`: integración.
- `feature/auth`, `feature/reports-crud`, `feature/native-plugins`: trabajo por módulo.

## Requisitos

- Node.js 20+
- PostgreSQL 16 instalado localmente
- Android Studio (solo para `capacitor run android`)

## Variables de entorno

### Backend (`backend/.env`) — copia desde `backend/.env.example`

| Variable | Descripción |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a PostgreSQL local (`localhost:5435` en esta instalación) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos JWT (largos, aleatorios) |
| `JWT_ACCESS_EXPIRES` | Ej. `15m` |
| `JWT_REFRESH_EXPIRES_DAYS` | Ej. `7` |
| `PUBLIC_BASE_URL` | URL pública del API (imágenes) |
| `OPENWEATHER_API_KEY` | Clave de OpenWeather (opcional pero recomendada) |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_TO` | Notificación por correo (opcional) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_COMPANY` | Usuario admin del seed |

### Frontend

`src/environments/environment.ts` solo contiene `apiUrl` (no secrets). En producción cambia `environment.prod.ts`.

Para Android emulador usa `http://10.0.2.2:3000/api` en lugar de `localhost`.

## Base de datos y backend

Instala PostgreSQL 16 para Windows y crea el usuario y la base de datos desde
SQL Shell (`psql`) o pgAdmin:

```sql
CREATE USER siperil WITH PASSWORD 'siperil';
CREATE DATABASE siperil OWNER siperil;
```

```bash
cd backend
copy .env.example .env   # Windows; en Unix: cp .env.example .env
# Edita .env: secretos JWT y ADMIN_PASSWORD
npm install
npm run migration:run
npm run seed
npm run dev
```

- API: http://localhost:3000/api/health
- Swagger: http://localhost:3000/api/docs

## Frontend (Ionic)

```bash
cd siperil-hybrid/frontend
npm install
npx ionic serve
```

Pruebas unitarias:

```bash
npm test
```

Backend:

```bash
cd backend
npm test
```

## Capacitor (Android)

1. En `environment.ts` apunta al API alcanzable desde el dispositivo.
2. Añade el proyecto nativo (una sola vez):

```bash
cd frontend
npx ionic build
npx cap add android
npx cap sync
```

3. Permisos en `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

4. iOS (`Info.plist`): `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`.

```bash
npx ionic capacitor run android
```

## Postman

Importa `postman/SIPERIL.postman_collection.json`. Orden sugerido: Health → Registro → Login worker → Crear reporte → Listar → Actualizar → Login admin → Stats → Resolver → Logout.

Captura pantallas de las respuestas (código 201/200/204) para la evidencia de la materia.

## Sincronización SQLite ↔ PostgreSQL

Cada listado exitoso de reportes **reescribe** la caché local. Si el API no responde, la lista se lee de SQLite (nativo) o del espejo en `localStorage` (`ionic serve`). No hay cola de escritura offline en esta versión: crear/editar/eliminar requieren red.

## Modelo relacional (equivalente a Firestore)

| Firestore | PostgreSQL |
| --- | --- |
| `users/{uid}` | tabla `User` |
| `reports/{id}` | tabla `Report` |
| Storage `reports_images/...` | archivo en `backend/uploads` + `Report.imageUrl` |
| tokens de Firebase Auth | `RefreshToken` (hash) + JWT de acceso |

Roles: `worker` (CRUD de sus reportes) y `admin` (listado global, stats, resolver).
