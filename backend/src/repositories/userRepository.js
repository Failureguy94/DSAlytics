const db = require('../config/db');

async function findByEmail(email) {
  const result = await db.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, is_active, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findByUsername(username) {
  const result = await db.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, is_active, created_at, updated_at
     FROM users
     WHERE username = $1
     LIMIT 1`,
    [username]
  );

  return result.rows[0] || null;
}

async function findByEmailOrUsername(identifier) {
  const result = await db.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, is_active, created_at, updated_at
     FROM users
     WHERE email = $1 OR username = $1
     LIMIT 1`,
    [identifier]
  );

  return result.rows[0] || null;
}

async function createUser({ id, username, email, passwordHash, displayName, avatarUrl }) {
  const result = await db.query(
    `INSERT INTO users (id, username, email, password_hash, display_name, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, display_name, avatar_url, is_active, created_at, updated_at`,
    [id, username, email, passwordHash, displayName || null, avatarUrl || null]
  );

  return result.rows[0];
}

module.exports = {
  findByEmail,
  findByUsername,
  findByEmailOrUsername,
  createUser
};
