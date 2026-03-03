const express = require('express');

const analyticsController = require('../controllers/analyticsController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');

const heatmapRouter = express.Router();
heatmapRouter.use(authMiddleware);
heatmapRouter.get('/', asyncHandler(analyticsController.getHeatmap));
heatmapRouter.get('/:date/platforms', asyncHandler(analyticsController.getPlatformBreakdown));

const historyRouter = express.Router();
historyRouter.use(authMiddleware);
historyRouter.get('/:date', asyncHandler(analyticsController.getSubmissionHistory));

module.exports = {
  heatmapRouter,
  historyRouter
};
