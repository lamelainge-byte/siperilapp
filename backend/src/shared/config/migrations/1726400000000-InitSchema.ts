import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1726400000000 implements MigrationInterface {
  name = 'InitSchema1726400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('worker', 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "ReportType" AS ENUM ('unsafe_condition', 'work_accident', 'maintenance', 'road_accident');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "ReportStatus" AS ENUM ('pending', 'resolved');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "role" "Role" NOT NULL DEFAULT 'worker',
        "status" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);
    await queryRunner.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" INTEGER NOT NULL DEFAULT 1`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "RefreshToken" (
        "id" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "revokedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "Site" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "address" TEXT,
        "area" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "Report" (
        "id" TEXT NOT NULL,
        "reportType" "ReportType" NOT NULL,
        "userId" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "incidentDate" TIMESTAMP(3),
        "incidentTime" TEXT,
        "shift" TEXT,
        "place" TEXT,
        "siteId" TEXT,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "weatherSummary" TEXT,
        "imageUrl" TEXT,
        "status" "ReportStatus" NOT NULL DEFAULT 'pending',
        "resolvedAt" TIMESTAMP(3),
        "resolvedById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "siteId" TEXT`);
    await queryRunner.query(`ALTER TABLE "Report" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "Site" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "RefreshToken"
          ADD CONSTRAINT "RefreshToken_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "Report"
          ADD CONSTRAINT "Report_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "Report"
          ADD CONSTRAINT "Report_resolvedById_fkey"
          FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "Report"
          ADD CONSTRAINT "Report_siteId_fkey"
          FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "_prisma_migrations"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_siteId_fkey"`);
    await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_resolvedById_fkey"`);
    await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_userId_fkey"`);
    await queryRunner.query(`ALTER TABLE "RefreshToken" DROP CONSTRAINT IF EXISTS "RefreshToken_userId_fkey"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Report"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Site"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "RefreshToken"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "User"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ReportStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ReportType"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "Role"`);
  }
}
