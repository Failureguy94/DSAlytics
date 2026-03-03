const express = require('express');

const handleController = require('../controllers/handleController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', asyncHandler(handleController.addHandle));
router.get('/', asyncHandler(handleController.getHandles));
router.patch('/:handleId', asyncHandler(handleController.updateHandle));
router.delete('/:handleId', asyncHandler(handleController.deleteHandle));

module.exports = router;
