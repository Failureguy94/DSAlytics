const { v4: uuidv4 } = require('uuid');

const handleRepository = require('../repositories/handleRepository');
const problemRepository = require('../repositories/problemRepository');
const submissionRepository = require('../repositories/submissionRepository');
const activityRepository = require('../repositories/activityRepository');
const AppError = require('../utils/appError');
const { toUTCDateString } = require('../utils/date');

const LANGUAGES = ['C++17', 'Java 17', 'Python 3.12', 'JavaScript'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function buildSimulatedBatch(handle) {
  const today = new Date();
  const baseUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const batch = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const submittedAt = new Date(baseUtc - offset * 24 * 60 * 60 * 1000 + (12 * 60 + offset) * 60 * 1000).toISOString();
    const externalId = `SIM-${handle.platform_id}-${offset + 1}`;
    const title = `Simulated Problem ${offset + 1}`;

    batch.push({
      externalId,
      title,
      url: `${handle.base_url}/problems/${externalId.toLowerCase()}`,
      difficulty: DIFFICULTIES[offset % DIFFICULTIES.length],
      tags: ['simulation', `day-${offset + 1}`],
      submittedAt,
      language: LANGUAGES[offset % LANGUAGES.length],
      submissionExternalId: `SIM-SUB-${handle.id}-${offset + 1}`
    });
  }

  return batch;
}

async function syncHandle(userId, handleId) {
  const handle = await handleRepository.getHandleByIdAndUserId(handleId, userId);
  if (!handle) {
    throw new AppError('handle not found', 404);
  }

  if (!handle.is_active) {
    throw new AppError('handle is inactive', 400);
  }

  const simulatedBatch = buildSimulatedBatch(handle);
  const affectedDates = new Set();
  let insertedCount = 0;

  for (const item of simulatedBatch) {
    const problem = await problemRepository.upsertProblem({
      id: uuidv4(),
      platformId: handle.platform_id,
      externalId: item.externalId,
      title: item.title,
      url: item.url,
      difficulty: item.difficulty,
      tags: item.tags
    });

    const insertResult = await submissionRepository.insertSubmissionIgnoreConflict({
      id: uuidv4(),
      userPlatformHandleId: handle.id,
      problemId: problem.id,
      submittedAt: item.submittedAt,
      language: item.language,
      submissionExternalId: item.submissionExternalId
    });

    if (insertResult.inserted) {
      insertedCount += 1;
    }

    const activityDate = toUTCDateString(item.submittedAt);
    if (activityDate) {
      affectedDates.add(activityDate);
    }
  }

  const sortedDates = [...affectedDates].sort();

  for (const activityDate of sortedDates) {
    await activityRepository.upsertDailyActivityForDate(userId, activityDate);
    await activityRepository.upsertDailyPlatformActivityForDate(userId, activityDate);
  }

  const updatedHandle = await handleRepository.touchLastSyncedAt(handle.id);

  return {
    handle_id: handle.id,
    platform_id: handle.platform_id,
    simulated_count: simulatedBatch.length,
    inserted_count: insertedCount,
    activity_dates_recalculated: sortedDates,
    last_synced_at: updatedHandle ? updatedHandle.last_synced_at : null
  };
}

module.exports = {
  syncHandle
};
