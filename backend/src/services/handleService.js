const { v4: uuidv4 } = require('uuid');

const handleRepository = require('../repositories/handleRepository');
const platformRepository = require('../repositories/platformRepository');
const AppError = require('../utils/appError');

function validateHandleInput(platformId, handle) {
  if (!Number.isInteger(platformId) || platformId <= 0) {
    throw new AppError('platform_id must be a positive integer', 400);
  }

  if (!handle || typeof handle !== 'string' || !handle.trim()) {
    throw new AppError('handle is required', 400);
  }

  if (handle.trim().length > 100) {
    throw new AppError('handle must not exceed 100 characters', 400);
  }
}

async function addHandle(userId, payload) {
  const platformId = Number(payload.platform_id);
  const handle = String(payload.handle || '').trim();
  const syncCursor = payload.sync_cursor !== undefined ? String(payload.sync_cursor) : null;

  validateHandleInput(platformId, handle);

  const platform = await platformRepository.findById(platformId);
  if (!platform || !platform.is_active) {
    throw new AppError('platform not found or inactive', 404);
  }

  try {
    return await handleRepository.createHandle({
      id: uuidv4(),
      userId,
      platformId,
      handle,
      syncCursor
    });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('handle already exists for this user/platform', 409);
    }
    throw error;
  }
}

async function getHandles(userId) {
  return handleRepository.getHandlesByUserId(userId);
}

async function updateHandle(userId, handleId, payload) {
  const existing = await handleRepository.getHandleByIdAndUserId(handleId, userId);
  if (!existing) {
    throw new AppError('handle not found', 404);
  }

  const nextHandle = payload.handle !== undefined ? String(payload.handle).trim() : undefined;
  const nextIsActive = payload.is_active;
  const nextSyncCursor = payload.sync_cursor;

  if (nextHandle !== undefined) {
    if (!nextHandle) {
      throw new AppError('handle cannot be empty', 400);
    }
    if (nextHandle.length > 100) {
      throw new AppError('handle must not exceed 100 characters', 400);
    }
  }

  if (nextIsActive !== undefined && typeof nextIsActive !== 'boolean') {
    throw new AppError('is_active must be boolean', 400);
  }

  if (nextSyncCursor !== undefined && nextSyncCursor !== null && typeof nextSyncCursor !== 'string') {
    throw new AppError('sync_cursor must be a string or null', 400);
  }

  try {
    const updated = await handleRepository.updateHandleByIdAndUserId({
      handleId,
      userId,
      handle: nextHandle,
      isActive: nextIsActive,
      syncCursor: nextSyncCursor
    });

    if (!updated) {
      throw new AppError('handle not found', 404);
    }

    return updated;
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('handle already exists for this user/platform', 409);
    }
    throw error;
  }
}

async function deleteHandle(userId, handleId) {
  const deleted = await handleRepository.deleteHandleByIdAndUserId(handleId, userId);
  if (!deleted) {
    throw new AppError('handle not found', 404);
  }
}

module.exports = {
  addHandle,
  getHandles,
  updateHandle,
  deleteHandle
};
