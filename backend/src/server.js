const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Route handlers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/communities');
const itemRoutes = require('./routes/items');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/bookings');
const ratingRoutes = require('./routes/ratings');
const paymentRoutes = require('./routes/payments');
const statsRoutes = require('./routes/stats');
const queryRoutes = require('./routes/query');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: isDbConnected ? 'healthy' : 'degraded',
    service: 'ToolLoop Backend API',
    database: {
      engine: 'MySQL',
      name: process.env.DB_NAME || 'toolloop',
      connected: isDbConnected
    },
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/query', queryRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    name: 'ToolLoop API',
    status: 'online',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(` ToolLoop Backend Server running on http://localhost:${PORT}`);
  console.log(` Database: ${process.env.DB_NAME || 'toolloop'} (MySQL)`);
  console.log(`=======================================================`);
  await testConnection();
});
