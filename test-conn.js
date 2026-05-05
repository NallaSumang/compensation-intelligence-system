const { Client } = require('pg');

async function testConnection(name, connectionString) {
  console.log(`\nTesting ${name}...`);
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`✅ SUCCESS: ${name}`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${name} -> ${error.message}`);
    return false;
  }
}

async function run() {
  const psw = "%5B12344321%40Ng1234432%5D";
  const project = "tbhzanzrmxpmwhngdqrv";

  const strings = [
    {
      name: "Direct Connection (IPv6)",
      url: `postgresql://postgres:${psw}@db.${project}.supabase.co:5432/postgres`
    },
    {
      name: "Pooler Connection (Port 6543)",
      url: `postgresql://postgres.${project}:${psw}@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
    },
    {
      name: "Pooler Connection (Port 5432)",
      url: `postgresql://postgres.${project}:${psw}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
    }
  ];

  for (const s of strings) {
    await testConnection(s.name, s.url);
  }
}

run();
