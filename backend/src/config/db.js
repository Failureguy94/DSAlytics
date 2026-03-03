const { Pool } = require('pg');

function createPoolConfig() {
  if (process.env.DATABASE_URL) {
    const useSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: String(process.env.DB_SSL || 'false').toLowerCase() === 'true' ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(createPoolConfig());

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
