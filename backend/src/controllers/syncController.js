const syncService = require('../services/syncService');

async function syncHandle(req, res) {
  const result = await syncService.syncHandle(req.user.id, req.params.handleId);
  res.status(200).json({
    success: true,
    message: 'Sync completed',
    data: result
  });
}

module.exports = {
  syncHandle
};
