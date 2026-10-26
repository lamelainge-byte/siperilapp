import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AccessLog1726700000000 implements MigrationInterface {
  name = 'AccessLog1726700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "AccessLog" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "employeeNumber" TEXT,
        "kind" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "AccessLog"`);
  }
}
