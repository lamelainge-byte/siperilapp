// comando aparte: npm run seed, crea el admin con admin_email y admin_password, no corre con npm run dev
import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { ReportModel } from '../../modules/reports/infrastructure/persistence/ReportModel.js';
import { SiteModel } from '../../modules/sites/infrastructure/persistence/SiteModel.js';
import { UserModel } from '../../modules/users/infrastructure/persistence/UserModel.js';
import { AppDataSource } from './data-source.js';
import { envs } from './environment-vars.js';

async function seed() {
  if (!envs.admin.password) {
    throw new Error('Define ADMIN_PASSWORD en .env antes de ejecutar el seed');
  }

  await AppDataSource.initialize();
  const users = AppDataSource.getRepository(UserModel);
  const reports = AppDataSource.getRepository(ReportModel);
  const sites = AppDataSource.getRepository(SiteModel);
  const now = new Date();

  // crea o actualiza el administrador con la clave del archivo env
  const passwordHash = await bcrypt.hash(envs.admin.password, 12);
  let admin = await users.findOne({ where: { email: envs.admin.email } });
  if (!admin) {
    admin = await users.save(
      users.create({
        id: crypto.randomUUID(),
        email: envs.admin.email,
        name: envs.admin.name,
        company: envs.admin.company,
        role: 'admin',
        status: 1,
        passwordHash,
        createdAt: now,
      }),
    );
  } else {
    admin.role = 'admin';
    admin.passwordHash = passwordHash;
    await users.save(admin);
  }
  console.log(`Admin listo: ${envs.admin.email}`);

  const workerHash = await bcrypt.hash('secreto123', 12);
  let worker = await users.findOne({ where: { email: 'ana@empresa.com' } });
  if (!worker) {
    worker = await users.save(
      users.create({
        id: crypto.randomUUID(),
        email: 'ana@empresa.com',
        name: 'Ana Trabajadora',
        company: 'Empresa Demo',
        employeeNumber: '1001',
        role: 'worker',
        status: 1,
        passwordHash: workerHash,
        createdAt: now,
      }),
    );
  }

  const existingReports = await reports.count({ where: { userId: worker.id } });
  if (existingReports === 0) {
    await reports.save([
      reports.create({
        id: crypto.randomUUID(),
        reportType: 'unsafe_condition',
        userId: worker.id,
        company: worker.company,
        description: 'Pasillo sin señalización de emergencia (dato de demostración)',
        place: 'Bodega 2',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }),
      reports.create({
        id: crypto.randomUUID(),
        reportType: 'work_accident',
        userId: worker.id,
        company: worker.company,
        description: 'Resbalón en área húmeda — ya atendido (demostración)',
        place: 'Planta 1',
        shift: 'mañana',
        status: 'resolved',
        resolvedAt: now,
        resolvedById: admin.id,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    console.log('Reportes de demostración creados');
  }

  const siteCount = await sites.count();
  if (siteCount === 0) {
    await sites.save([
      sites.create({
        id: crypto.randomUUID(),
        name: 'Bodega 2',
        company: worker.company,
        area: 'Almacén',
        address: 'Sector norte',
        active: true,
        createdAt: now,
        updatedAt: now,
      }),
      sites.create({
        id: crypto.randomUUID(),
        name: 'Planta 1',
        company: worker.company,
        area: 'Producción',
        address: 'Nave principal',
        active: true,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    console.log('Sitios de demostración creados');
  }

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
