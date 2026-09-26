import 'dotenv/config';
import Joi from 'joi';

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
  // si llega DATABASE_URL se parte en host, puerto, usuario y base
  const url = process.env.DATABASE_URL;
  if (!url || process.env.DB_HOST) {
    return;
  }
  try {
    const parsed = new URL(url);
    process.env.DB_HOST ??= parsed.hostname;
    process.env.DB_PORT ??= parsed.port || '5432';
    process.env.DB_USER ??= decodeURIComponent(parsed.username);
    process.env.DB_PASSWORD ??= decodeURIComponent(parsed.password);
    process.env.DB_NAME ??= parsed.pathname.replace(/^\//, '').split('?')[0];
  } catch {
    throw new Error('DATABASE_URL no es una URL de PostgreSQL válida');
  }
}

applyDatabaseUrlFallback();

const schema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().default('development'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_NAME: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
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
    host: validated.DB_HOST,
    port: validated.DB_PORT,
    user: validated.DB_USER,
    password: validated.DB_PASSWORD ?? '',
    name: validated.DB_NAME,
  },
  jwtAccessSecret: validated.JWT_ACCESS_SECRET,
  jwtRefreshSecret: validated.JWT_REFRESH_SECRET,
  jwtAccessExpires: validated.JWT_ACCESS_EXPIRES,
  jwtRefreshExpiresDays: validated.JWT_REFRESH_EXPIRES_DAYS,
  publicBaseUrl: validated.PUBLIC_BASE_URL,
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
