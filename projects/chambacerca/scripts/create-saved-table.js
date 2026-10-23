const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS chambacerca."SavedVacancy" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "vacancyId" TEXT NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SavedVacancy_userId_fkey" FOREIGN KEY ("userId") REFERENCES chambacerca."User"("id") ON DELETE CASCADE,
      CONSTRAINT "SavedVacancy_user_vacancy_unique" UNIQUE ("userId", "vacancyId")
    );
  `);
  await sql.query(`
    CREATE INDEX IF NOT EXISTS "SavedVacancy_userId_idx" ON chambacerca."SavedVacancy"("userId");
  `);
  console.log('✅ Tabla SavedVacancy creada con éxito en Neon PostgreSQL.');
}

run().catch(console.error);
