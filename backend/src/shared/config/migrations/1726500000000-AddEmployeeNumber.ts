import type { MigrationInterface, QueryRunner } from 'typeorm';

// agrega el numero del trabajador a las cuentas que ya existen
export class AddEmployeeNumber1726500000000 implements MigrationInterface {
  name = 'AddEmployeeNumber1726500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "employeeNumber" TEXT`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_employeeNumber_key"
      ON "User"("employeeNumber")
      WHERE "employeeNumber" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "User_employeeNumber_key"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN IF EXISTS "employeeNumber"`);
  }
}
