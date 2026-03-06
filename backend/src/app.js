const express = require('express');
const cors = require('cors');// used duw to CORS error in frontend when making API calls to backend
// Why his happens: When the frontend (running on a different origin, e.g., http://localhost:3000) tries to make API calls to the backend (e.g., http://localhost:5000), the browser's same-origin policy blocks these requests for security reasons. CORS (Cross-Origin Resource Sharing) is a mechanism that allows servers to specify who can access their resources and how. By using the `cors` middleware in the backend, we can enable CORS and allow the frontend to communicate with the backend without being blocked by the browser.

const authRoutes = require('./routes/authRoutes');
const handleRoutes = require('./routes/handleRoutes');
const syncRoutes = require('./routes/syncRoutes');
const { heatmapRouter, historyRouter } = require('./routes/analyticsRoutes');
const AppError = require('./utils/appError');

const app = express();

app.use(cors());// enabling CORS for all routes and origins. In production, you might want to restrict this to specific origins for better security.
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/handles', handleRoutes);
app.use('/sync', syncRoutes);
app.use('/heatmap', heatmapRouter);
app.use('/history', historyRouter);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate data violates a unique constraint'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference for a foreign key'
    });
  }

  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input format'
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
