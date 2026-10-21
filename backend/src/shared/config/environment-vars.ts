import 'dotenv/config';
// carga backend/.env y deja cada variable en process.env antes de validar
import Joi from 'joi';
// joi revisa que existan host, base y secretos, si falta algo, el api no arranca

export type EnvVars = {
  PORT: number;
  NODE_ENV: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES_DAYS: number;
  PUBLIC_BASE_URL: string;
  OPENWEATHER_API_KEY: string;
  EMAILJS_SERVICE_ID: string;
  EMAILJS_TEMPLATE_ID: string;
  EMAILJS_PUBLIC_KEY: string;
  EMAILJS_TO: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_NAME: string;
  ADMIN_COMPANY: string;
};

function applyDatabaseUrlFallback() {
  // si solo llega database_url (postgres://usuario:clave@host:puerto/base), se parte en db_host, db_port, etc
  const url = process.env.DATABASE_URL;
  if (!url) {
    return;
  }
  try {
    const parsed = new URL(url);
    const ssl = parsed.searchParams.get('sslmode') === 'require';
    // la url cifrada de neon gana sobre el host local del archivo env
    if (!ssl && process.env.DB_HOST) {
      return;
    }
    process.env.DB_HOST = parsed.hostname;
    process.env.DB_PORT = parsed.port || '5432';
    process.env.DB_USER = decodeURIComponent(parsed.username);
    process.env.DB_PASSWORD = decodeURIComponent(parsed.password);
    process.env.DB_NAME = parsed.pathname.replace(/^\//, '').split('?')[0];
    if (ssl) {
      process.env.DB_SSL = 'true';
    }
  } catch {
    throw new Error('DATABASE_URL no es una URL de PostgreSQL válida');
  }
}

applyDatabaseUrlFallback();

const schema = Joi.object({
  PORT: Joi.number().default(3000), // puerto http del api, por defecto 3000
  NODE_ENV: Joi.string().default('development'),
  DB_HOST: Joi.string().required(), // obligatorio: sin host no hay conexion
  DB_PORT: Joi.number().default(5432), // puerto de postgresql, no el del api
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_NAME: Joi.string().required(), // nombre de la base
  JWT_ACCESS_SECRET: Joi.string().min(16).required(), // firma del access token
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('8h'),
  JWT_REFRESH_EXPIRES_DAYS: Joi.number().default(7),
  PUBLIC_BASE_URL: Joi.string().default('http://localhost:3000'),
  OPENWEATHER_API_KEY: Joi.string().allow('').default(''),
  EMAILJS_SERVICE_ID: Joi.string().allow('').default(''),
  EMAILJS_TEMPLATE_ID: Joi.string().allow('').default(''),
  EMAILJS_PUBLIC_KEY: Joi.string().allow('').default(''),
  EMAILJS_TO: Joi.string().allow('').default(''),
  ADMIN_EMAIL: Joi.string().email({ tlds: { allow: false } }).default('admin@siperil.local'),
  ADMIN_PASSWORD: Joi.string().allow('').default(''),
  ADMIN_NAME: Joi.string().default('Administrador SIPERIL'),
  ADMIN_COMPANY: Joi.string().default('SIPERIL'),
}).unknown(true);

const { error, value } = schema.validate(process.env, { abortEarly: false });

if (error) {
  // el api no arranca si faltan secretos o datos de la base
  throw new Error(`Variables de entorno inválidas: ${error.message}`);
}

const validated = value as EnvVars;

export const envs = {
  port: validated.PORT,
  nodeEnv: validated.NODE_ENV,
  db: {
    // este objeto es el que lee data-source.ts para abrir postgresql
    host: validated.DB_HOST,
    port: validated.DB_PORT,
    user: validated.DB_USER,
    password: validated.DB_PASSWORD ?? '',
    name: validated.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
  },
  jwtAccessSecret: validated.JWT_ACCESS_SECRET,
  jwtRefreshSecret: validated.JWT_REFRESH_SECRET,
  jwtAccessExpires: validated.JWT_ACCESS_EXPIRES,
  jwtRefreshExpiresDays: validated.JWT_REFRESH_EXPIRES_DAYS,
  // render entrega su direccion publica; si no existe se usa la del archivo env
  publicBaseUrl: process.env.RENDER_EXTERNAL_URL || validated.PUBLIC_BASE_URL,
  openWeatherApiKey: validated.OPENWEATHER_API_KEY,
  emailJs: {
    serviceId: validated.EMAILJS_SERVICE_ID,
    templateId: validated.EMAILJS_TEMPLATE_ID,
    publicKey: validated.EMAILJS_PUBLIC_KEY,
    to: validated.EMAILJS_TO,
  },
  admin: {
    email: validated.ADMIN_EMAIL,
    password: validated.ADMIN_PASSWORD,
    name: validated.ADMIN_NAME,
    company: validated.ADMIN_COMPANY,
  },
};
