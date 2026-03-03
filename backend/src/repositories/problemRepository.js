const db = require('../config/db');

async function upsertProblem({ id, platformId, externalId, title, url, difficulty, tags }) {
  const result = await db.query(
    `INSERT INTO problems (id, platform_id, external_id, title, url, difficulty, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (platform_id, external_id)
     DO UPDATE SET
       title = EXCLUDED.title,
       url = EXCLUDED.url,
       difficulty = EXCLUDED.difficulty,
       tags = EXCLUDED.tags
     RETURNING id, platform_id, external_id, title, url, difficulty, tags, created_at`,
    [id, platformId, externalId, title, url, difficulty || null, tags || null]
  );

  return result.rows[0];
}

module.exports = {
  upsertProblem
};
