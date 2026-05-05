require('dotenv').config();
const { Client } = require('pg');

async function syncDb() {
  console.log("Connecting using direct pg driver to bypass Prisma Rust Engine networking issues...");
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully!");

    const sql = `
      CREATE TABLE IF NOT EXISTS "Salary" (
          "id" TEXT NOT NULL,
          "companyNormalized" TEXT NOT NULL,
          "companyRaw" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "level" TEXT NOT NULL,
          "location" TEXT NOT NULL,
          "yoe" DOUBLE PRECISION NOT NULL,
          "baseSalary" INTEGER NOT NULL,
          "bonus" INTEGER NOT NULL DEFAULT 0,
          "stock" INTEGER NOT NULL DEFAULT 0,
          "totalComp" INTEGER NOT NULL,
          "confidenceScore" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "Salary_companyNormalized_role_level_location_yoe_baseSal_key" ON "Salary"("companyNormalized", "role", "level", "location", "yoe", "baseSalary");

      CREATE INDEX IF NOT EXISTS "Salary_companyNormalized_idx" ON "Salary"("companyNormalized");
    `;

    await client.query(sql);
    console.log("Schema successfully synced to the database!");
    
  } catch (error) {
    console.error("Failed to sync database:", error);
  } finally {
    await client.end();
  }
}

syncDb();
