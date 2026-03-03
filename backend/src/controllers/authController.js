const authService = require('../services/authService');

async function register(req, res) {
  const result = await authService.register(req.body || {});
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
}

async function login(req, res) {
  const result = await authService.login(req.body || {});
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
}

module.exports = {
  register,
  login
};
