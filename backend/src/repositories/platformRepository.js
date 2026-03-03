const db = require('../config/db');

async function findById(platformId) {
  const result = await db.query(
    `SELECT id, name, slug, base_url, is_active
     FROM platforms
     WHERE id = $1
     LIMIT 1`,
    [platformId]
  );

  return result.rows[0] || null;
}

module.exports = {
  findById
};
