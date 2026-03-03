const db = require('../config/db');

async function upsertDailyActivityForDate(userId, activityDate) {
  const result = await db.query(
    `INSERT INTO daily_activity (user_id, activity_date, total_count)
     VALUES (
       $1,
       $2::date,
       (
         SELECT COUNT(*)::int
         FROM submissions s
         JOIN user_platform_handles uph ON uph.id = s.user_platform_handle_id
         WHERE uph.user_id = $1
           AND DATE(s.submitted_at AT TIME ZONE 'UTC') = $2::date
       )
     )
     ON CONFLICT (user_id, activity_date)
     DO UPDATE SET
       total_count = EXCLUDED.total_count,
       updated_at = now()
     RETURNING id, user_id, activity_date, total_count, updated_at`,
    [userId, activityDate]
  );

  return result.rows[0];
}

async function upsertDailyPlatformActivityForDate(userId, activityDate) {
  const result = await db.query(
    `INSERT INTO daily_platform_activity (id, user_id, platform_id, activity_date, count)
     SELECT gen_random_uuid(),
            $1,
            src.platform_id,
            $2::date,
            src.count
     FROM (
       SELECT pr.platform_id, COUNT(*)::int AS count
       FROM submissions s
       JOIN user_platform_handles uph ON uph.id = s.user_platform_handle_id
       JOIN problems pr ON pr.id = s.problem_id
       WHERE uph.user_id = $1
         AND DATE(s.submitted_at AT TIME ZONE 'UTC') = $2::date
       GROUP BY pr.platform_id
     ) src
     ON CONFLICT (user_id, platform_id, activity_date)
     DO UPDATE SET
       count = EXCLUDED.count,
       updated_at = now()
     RETURNING id, user_id, platform_id, activity_date, count, updated_at`,
    [userId, activityDate]
  );

  return result.rows;
}

async function getHeatmapByUser(userId, days) {
  const result = await db.query(
    `SELECT activity_date, total_count
     FROM daily_activity
     WHERE user_id = $1
       AND activity_date >= CURRENT_DATE - $2::int
     ORDER BY activity_date`,
    [userId, days]
  );

  return result.rows;
}

async function getPlatformBreakdownByUserAndDate(userId, activityDate) {
  const result = await db.query(
    `SELECT p.id AS platform_id,
            p.name AS platform_name,
            p.slug AS platform_slug,
            dpa.count
     FROM daily_platform_activity dpa
     JOIN platforms p ON p.id = dpa.platform_id
     WHERE dpa.user_id = $1
       AND dpa.activity_date = $2::date
     ORDER BY dpa.count DESC, p.name`,
    [userId, activityDate]
  );

  return result.rows;
}

module.exports = {
  upsertDailyActivityForDate,
  upsertDailyPlatformActivityForDate,
  getHeatmapByUser,
  getPlatformBreakdownByUserAndDate
};
