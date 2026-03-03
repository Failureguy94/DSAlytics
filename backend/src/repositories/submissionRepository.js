const db = require('../config/db');

async function insertSubmissionIgnoreConflict({
  id,
  userPlatformHandleId,
  problemId,
  submittedAt,
  language,
  submissionExternalId
}) {
  const result = await db.query(
    `INSERT INTO submissions (
      id,
      user_platform_handle_id,
      problem_id,
      submitted_at,
      language,
      submission_external_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_platform_handle_id, problem_id, submitted_at)
    DO NOTHING
    RETURNING id`,
    [id, userPlatformHandleId, problemId, submittedAt, language || null, submissionExternalId || null]
  );

  return {
    inserted: result.rowCount > 0,
    row: result.rows[0] || null
  };
}

async function getSubmissionHistoryByUserAndDate(userId, activityDate) {
  const result = await db.query(
    `SELECT s.id AS submission_id,
            s.submitted_at,
            s.language,
            s.submission_external_id,
            uph.id AS user_platform_handle_id,
            uph.handle,
            pr.id AS problem_id,
            pr.external_id,
            pr.title,
            pr.url,
            pr.difficulty,
            pr.tags,
            p.id AS platform_id,
            p.name AS platform_name,
            p.slug AS platform_slug
     FROM submissions s
     JOIN user_platform_handles uph ON uph.id = s.user_platform_handle_id
     JOIN problems pr ON pr.id = s.problem_id
     JOIN platforms p ON p.id = pr.platform_id
     WHERE uph.user_id = $1
       AND DATE(s.submitted_at AT TIME ZONE 'UTC') = $2::date
     ORDER BY s.submitted_at DESC`,
    [userId, activityDate]
  );

  return result.rows;
}

module.exports = {
  insertSubmissionIgnoreConflict,
  getSubmissionHistoryByUserAndDate
};
