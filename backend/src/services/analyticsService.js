const activityRepository = require('../repositories/activityRepository');
const submissionRepository = require('../repositories/submissionRepository');
const AppError = require('../utils/appError');
const { isValidDateString } = require('../utils/date');

async function getHeatmap(userId, days) {
  const parsedDays = Number(days || 365);

  if (!Number.isInteger(parsedDays) || parsedDays <= 0 || parsedDays > 3650) {
    throw new AppError('days must be an integer between 1 and 3650', 400);
  }

  return activityRepository.getHeatmapByUser(userId, parsedDays);
}

async function getPlatformBreakdown(userId, date) {
  if (!isValidDateString(date)) {
    throw new AppError('date must be in YYYY-MM-DD format', 400);
  }

  return activityRepository.getPlatformBreakdownByUserAndDate(userId, date);
}

async function getSubmissionHistory(userId, date) {
  if (!isValidDateString(date)) {
    throw new AppError('date must be in YYYY-MM-DD format', 400);
  }

  return submissionRepository.getSubmissionHistoryByUserAndDate(userId, date);
}

module.exports = {
  getHeatmap,
  getPlatformBreakdown,
  getSubmissionHistory
};
