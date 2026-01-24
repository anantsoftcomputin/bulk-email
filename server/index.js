const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/email', emailRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bulk Email Sender API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/email/health',
      test: 'POST /api/email/test',
      verify: 'POST /api/email/verify',
      send: 'POST /api/email/send',
      sendBulk: 'POST /api/email/send-bulk',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  🚀 Bulk Email Sender API Server                     ║
║                                                       ║
║  Server running on: http://localhost:${PORT}           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                       ║
║  Available endpoints:                                 ║
║  GET  /                                               ║
║  GET  /api/email/health                               ║
║  POST /api/email/test                                 ║
║  POST /api/email/verify                               ║
║  POST /api/email/send                                 ║
║  POST /api/email/send-bulk                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
