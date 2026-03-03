require('dotenv').config();

const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.error('Failed to close DB pool:', error.message);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
