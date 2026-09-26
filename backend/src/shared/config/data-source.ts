import { DataSource } from 'typeorm';
import { RefreshTokenModel } from '../../modules/auth/infrastructure/persistence/RefreshTokenModel.js';
import { ReportModel } from '../../modules/reports/infrastructure/persistence/ReportModel.js';
import { SiteModel } from '../../modules/sites/infrastructure/persistence/SiteModel.js';
import { UserModel } from '../../modules/users/infrastructure/persistence/UserModel.js';
import { InitSchema1726400000000 } from './migrations/1726400000000-InitSchema.js';
import { envs } from './environment-vars.js';

// conexion a postgresql, synchronize queda apagado y las migraciones corren al iniciar
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envs.db.host,
  port: envs.db.port,
  username: envs.db.user,
  password: envs.db.password,
  database: envs.db.name,
  synchronize: false, // el esquema lo crean las migraciones, no typeorm al vuelo
  migrationsRun: true, // al conectar aplica las migraciones pendientes
  logging: envs.nodeEnv === 'development',
  entities: [UserModel, ReportModel, SiteModel, RefreshTokenModel],
  migrations: [InitSchema1726400000000],
});
