const express = require('express');

const syncController = require('../controllers/syncController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/:handleId', asyncHandler(syncController.syncHandle));

module.exports = router;
