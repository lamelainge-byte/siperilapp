import type { MigrationInterface, QueryRunner } from 'typeorm';

export class HeightEquipmentReport1726600000000 implements MigrationInterface {
  name = 'HeightEquipmentReport1726600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "ReportType" ADD VALUE 'height_equipment';
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "office" TEXT`);
    await queryRunner.query(`ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "equipmentType" TEXT`);
    await queryRunner.query(`ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "damageKind" TEXT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Report" DROP COLUMN IF EXISTS "damageKind"`);
    await queryRunner.query(`ALTER TABLE "Report" DROP COLUMN IF EXISTS "equipmentType"`);
    await queryRunner.query(`ALTER TABLE "Report" DROP COLUMN IF EXISTS "office"`);
  }
}
