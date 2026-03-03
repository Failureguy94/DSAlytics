const analyticsService = require('../services/analyticsService');

async function getHeatmap(req, res) {
  const result = await analyticsService.getHeatmap(req.user.id, req.query.days);
  res.status(200).json({
    success: true,
    data: result
  });
}

async function getPlatformBreakdown(req, res) {
  const result = await analyticsService.getPlatformBreakdown(req.user.id, req.params.date);
  res.status(200).json({
    success: true,
    data: result
  });
}

async function getSubmissionHistory(req, res) {
  const result = await analyticsService.getSubmissionHistory(req.user.id, req.params.date);
  res.status(200).json({
    success: true,
    data: result
  });
}

module.exports = {
  getHeatmap,
  getPlatformBreakdown,
  getSubmissionHistory
};
