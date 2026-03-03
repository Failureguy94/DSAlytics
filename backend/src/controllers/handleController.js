const handleService = require('../services/handleService');

async function addHandle(req, res) {
  const result = await handleService.addHandle(req.user.id, req.body || {});
  res.status(201).json({
    success: true,
    message: 'Platform handle added',
    data: result
  });
}

async function getHandles(req, res) {
  const result = await handleService.getHandles(req.user.id);
  res.status(200).json({
    success: true,
    data: result
  });
}

async function updateHandle(req, res) {
  const result = await handleService.updateHandle(req.user.id, req.params.handleId, req.body || {});
  res.status(200).json({
    success: true,
    message: 'Platform handle updated',
    data: result
  });
}

async function deleteHandle(req, res) {
  await handleService.deleteHandle(req.user.id, req.params.handleId);
  res.status(200).json({
    success: true,
    message: 'Platform handle deleted'
  });
}

module.exports = {
  addHandle,
  getHandles,
  updateHandle,
  deleteHandle
};
