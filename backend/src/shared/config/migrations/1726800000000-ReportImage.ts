import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ReportImage1726800000000 implements MigrationInterface {
  name = 'ReportImage1726800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ReportImage" (
        "filename" TEXT NOT NULL,
        "mime" TEXT NOT NULL,
        "data" BYTEA NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReportImage_pkey" PRIMARY KEY ("filename")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ReportImage"`);
  }
}
