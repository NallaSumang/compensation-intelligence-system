const { PrismaClient } = require('@prisma/client');

try {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  });
  console.log("Success with datasourceUrl");
} catch(e) {
  console.log("Error with datasourceUrl:", e.message);
}

try {
  const prisma2 = new PrismaClient({
    url: process.env.DATABASE_URL
  });
  console.log("Success with url");
} catch(e) {
  console.log("Error with url:", e.message);
}
