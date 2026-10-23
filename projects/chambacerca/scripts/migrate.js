const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const sql = neon(connectionString);

async function runMigration() {
  console.log('🔄 Iniciando migración DDL en Neon Serverless (schema chambacerca)...');

  try {
    // 1. Crear esquema
    await sql.query(`CREATE SCHEMA IF NOT EXISTS chambacerca;`);
    console.log('✅ Esquema chambacerca listo.');

    // 2. Tabla User
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chambacerca."User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'EMPLOYER',
        "company" TEXT,
        "phone" TEXT,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla User lista.');

    // 3. Tabla Vacancy
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chambacerca."Vacancy" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "placeName" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL DEFAULT 'Caracas',
        "latitude" DOUBLE PRECISION NOT NULL,
        "longitude" DOUBLE PRECISION NOT NULL,
        "jobType" TEXT NOT NULL DEFAULT 'FULL_TIME',
        "schedule" TEXT,
        "salaryRange" TEXT,
        "howToApply" TEXT NOT NULL DEFAULT 'IN_PERSON',
        "contactPhone" TEXT,
        "contactWhatsapp" TEXT,
        "contactEmail" TEXT,
        "applyInstructions" TEXT,
        "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "isVerified" BOOLEAN NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "viewsCount" INTEGER NOT NULL DEFAULT 0,
        "applicationsCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "employerId" TEXT,
        CONSTRAINT "Vacancy_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES chambacerca."User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    await sql.query(`CREATE INDEX IF NOT EXISTS "Vacancy_category_idx" ON chambacerca."Vacancy"("category");`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "Vacancy_status_idx" ON chambacerca."Vacancy"("status");`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "Vacancy_latitude_longitude_idx" ON chambacerca."Vacancy"("latitude", "longitude");`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "Vacancy_expiresAt_idx" ON chambacerca."Vacancy"("expiresAt");`);
    console.log('✅ Tabla Vacancy e índices listos.');

    // 4. Tabla VacancyFlag
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chambacerca."VacancyFlag" (
        "id" TEXT PRIMARY KEY,
        "vacancyId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "details" TEXT,
        "deviceHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "VacancyFlag_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES chambacerca."Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await sql.query(`CREATE INDEX IF NOT EXISTS "VacancyFlag_vacancyId_idx" ON chambacerca."VacancyFlag"("vacancyId");`);
    console.log('✅ Tabla VacancyFlag lista.');

    // 5. Tabla PlaceReport
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chambacerca."PlaceReport" (
        "id" TEXT PRIMARY KEY,
        "placeOsmId" TEXT NOT NULL,
        "placeName" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION NOT NULL,
        "longitude" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL,
        "roleHiring" TEXT,
        "comment" TEXT,
        "contactTip" TEXT,
        "deviceHash" TEXT NOT NULL,
        "upvotes" INTEGER NOT NULL DEFAULT 0,
        "downvotes" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL
      );
    `);
    await sql.query(`CREATE INDEX IF NOT EXISTS "PlaceReport_placeOsmId_idx" ON chambacerca."PlaceReport"("placeOsmId");`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "PlaceReport_latitude_longitude_idx" ON chambacerca."PlaceReport"("latitude", "longitude");`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "PlaceReport_expiresAt_idx" ON chambacerca."PlaceReport"("expiresAt");`);
    console.log('✅ Tabla PlaceReport lista.');

    // 6. Tabla PlaceCache
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chambacerca."PlaceCache" (
        "id" TEXT PRIMARY KEY,
        "osmId" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "address" TEXT,
        "latitude" DOUBLE PRECISION NOT NULL,
        "longitude" DOUBLE PRECISION NOT NULL,
        "phone" TEXT,
        "openingHours" TEXT,
        "website" TEXT,
        "rawTags" JSONB,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await sql.query(`CREATE INDEX IF NOT EXISTS "PlaceCache_category_idx" ON chambacerca."PlaceCache"("category");`);
    await sql.query(`CREATE INDEX IF NOT EXISTS "PlaceCache_latitude_longitude_idx" ON chambacerca."PlaceCache"("latitude", "longitude");`);
    console.log('✅ Tabla PlaceCache lista.');

    // 7. Tabla RateLimit
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chambacerca."RateLimit" (
        "key" TEXT PRIMARY KEY,
        "count" INTEGER NOT NULL DEFAULT 1,
        "resetAt" TIMESTAMP(3) NOT NULL
      );
    `);
    await sql.query(`CREATE INDEX IF NOT EXISTS "RateLimit_resetAt_idx" ON chambacerca."RateLimit"("resetAt");`);
    console.log('✅ Tabla RateLimit lista.');

    console.log('🎉 Migración completada exitosamente en Neon PostgreSQL.');
  } catch (err) {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  }
}

runMigration();
