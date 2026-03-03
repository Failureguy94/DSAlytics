const express = require('express');

const authRoutes = require('./routes/authRoutes');
const handleRoutes = require('./routes/handleRoutes');
const syncRoutes = require('./routes/syncRoutes');
const { heatmapRouter, historyRouter } = require('./routes/analyticsRoutes');
const AppError = require('./utils/appError');

const app = express();

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
