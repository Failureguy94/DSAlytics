const db = require('../config/db');

async function createHandle({ id, userId, platformId, handle, syncCursor }) {
  const result = await db.query(
    `INSERT INTO user_platform_handles (id, user_id, platform_id, handle, sync_cursor)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, platform_id, handle, is_active, last_synced_at, sync_cursor, created_at`,
    [id, userId, platformId, handle, syncCursor || null]
  );

  return result.rows[0];
}

async function getHandlesByUserId(userId) {
  const result = await db.query(
    `SELECT uph.id,
            uph.user_id,
            uph.platform_id,
            p.name AS platform_name,
            p.slug AS platform_slug,
            p.base_url,
            uph.handle,
            uph.is_active,
            uph.last_synced_at,
            uph.sync_cursor,
            uph.created_at
     FROM user_platform_handles uph
     JOIN platforms p ON p.id = uph.platform_id
     WHERE uph.user_id = $1
     ORDER BY uph.created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getHandleByIdAndUserId(handleId, userId) {
  const result = await db.query(
    `SELECT uph.id,
            uph.user_id,
            uph.platform_id,
            p.name AS platform_name,
            p.slug AS platform_slug,
            p.base_url,
            uph.handle,
            uph.is_active,
            uph.last_synced_at,
            uph.sync_cursor,
            uph.created_at
     FROM user_platform_handles uph
     JOIN platforms p ON p.id = uph.platform_id
     WHERE uph.id = $1 AND uph.user_id = $2
     LIMIT 1`,
    [handleId, userId]
  );

  return result.rows[0] || null;
}

async function updateHandleByIdAndUserId({ handleId, userId, handle, isActive, syncCursor }) {
  const fields = [];
  const values = [];

  if (typeof handle === 'string') {
    values.push(handle.trim());
    fields.push(`handle = $${values.length}`);
  }

  if (typeof isActive === 'boolean') {
    values.push(isActive);
    fields.push(`is_active = $${values.length}`);
  }

  if (syncCursor !== undefined) {
    values.push(syncCursor);
    fields.push(`sync_cursor = $${values.length}`);
  }

  if (fields.length === 0) {
    return getHandleByIdAndUserId(handleId, userId);
  }

  values.push(handleId);
  values.push(userId);

  const result = await db.query(
    `UPDATE user_platform_handles
     SET ${fields.join(', ')}
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING id, user_id, platform_id, handle, is_active, last_synced_at, sync_cursor, created_at`,
    values
  );

  return result.rows[0] || null;
}

async function touchLastSyncedAt(handleId) {
  const result = await db.query(
    `UPDATE user_platform_handles
     SET last_synced_at = now()
     WHERE id = $1
     RETURNING id, user_id, platform_id, handle, is_active, last_synced_at, sync_cursor, created_at`,
    [handleId]
  );

  return result.rows[0] || null;
}

async function deleteHandleByIdAndUserId(handleId, userId) {
  const result = await db.query(
    `DELETE FROM user_platform_handles
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [handleId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createHandle,
  getHandlesByUserId,
  getHandleByIdAndUserId,
  updateHandleByIdAndUserId,
  touchLastSyncedAt,
  deleteHandleByIdAndUserId
};
