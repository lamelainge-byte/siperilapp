import { DataSource } from 'typeorm';
// datasource es la clase de typeorm que representa la conexion a la base
import { RefreshTokenModel } from '../../modules/auth/infrastructure/persistence/RefreshTokenModel.js';
import { ReportModel } from '../../modules/reports/infrastructure/persistence/ReportModel.js';
import { SiteModel } from '../../modules/sites/infrastructure/persistence/SiteModel.js';
import { UserModel } from '../../modules/users/infrastructure/persistence/UserModel.js';
// cada import es una tabla: user, report, site y refreshtoken
import { InitSchema1726400000000 } from './migrations/1726400000000-InitSchema.js';
// esta clase trae el sql que crea esas tablas la primera vez
import { envs } from './environment-vars.js';
// host, puerto, usuario, clave y nombre de la base salen del .env ya validado

// appdatasource es la conexion, index.ts llama initialize() antes de abrir el puerto
export const AppDataSource = new DataSource({
  type: 'postgres', // el motor es postgresql
  host: envs.db.host, // db_host: donde esta el servidor de la base
  port: envs.db.port, // db_port: puerto en el que escucha postgresql
  username: envs.db.user, // db_user: usuario con el que entra
  password: envs.db.password, // db_password: clave de ese usuario
  database: envs.db.name, // db_name: la base, en este proyecto siperil
  // neon pide conexion cifrada; en local db_ssl no viene y queda apagado
  ssl: envs.db.ssl ? { rejectUnauthorized: false } : false,
  synchronize: false, // apagado: typeorm no crea ni cambia tablas al arrancar
  migrationsRun: true, // al conectar ejecuta las migraciones que aun no corrieron
  logging: envs.nodeEnv === 'development', // en desarrollo imprime el sql en la consola
  entities: [UserModel, ReportModel, SiteModel, RefreshTokenModel], // modelos que typeorm puede leer y guardar
  migrations: [InitSchema1726400000000], // migracion registrada: crea enums, tablas y llaves foraneas
});
