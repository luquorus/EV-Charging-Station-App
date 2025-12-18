/**
 * EV Charging Stations API Server
 *
 * API v1 endpoints:
 * - GET  /api/v1/stations (with pagination & filters)
 * - GET  /api/v1/stations/:id
 * - GET  /api/v1/stations/nearest
 * - GET  /api/v1/stations/in-range
 * - POST /api/v1/stations (ADMIN/EDITOR)
 * - POST /api/v1/stations/import-csv (ADMIN/EDITOR)
 * - PUT  /api/v1/stations/:id (ADMIN/EDITOR)
 * - DELETE /api/v1/stations/:id (ADMIN)
 * - POST /api/v1/range/calc
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/logout
 * - GET  /api/v1/users (ADMIN only)
 * - POST /api/v1/users (ADMIN only)
 * - PUT  /api/v1/users/:id (ADMIN only)
 * - DELETE /api/v1/users/:id (ADMIN only)
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./src/presentation/middleware/errorHandler');
const { rangeV1Router } = require('./src/presentation/routes/v1/rangeRoutes');
const { stationV1Router } = require('./src/presentation/routes/v1/stationV1Routes');
const { authV1Router } = require('./src/presentation/routes/v1/authRoutes');
const { userV1Router } = require('./src/presentation/routes/v1/userV1Routes');
const { connectMongo } = require('./src/infra/db/mongoClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ============ V1 API ROUTES ============

app.use('/api/v1/auth', authV1Router);
app.use('/api/v1/range', rangeV1Router);
app.use('/api/v1/stations', stationV1Router);
app.use('/api/v1/users', userV1Router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use(errorHandler);

// Start server
connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('\nAvailable endpoints:');
      console.log('  GET  /api/v1/stations (with pagination & filters)');
      console.log('  GET  /api/v1/stations/:id');
      console.log('  GET  /api/v1/stations/nearest?lat=&lng=&limit=');
      console.log('  GET  /api/v1/stations/in-range?lat=&lng=&radiusKm=');
      console.log('  POST /api/v1/stations (ADMIN/EDITOR)');
      console.log('  POST /api/v1/stations/import-csv (ADMIN/EDITOR)');
      console.log('  PUT  /api/v1/stations/:id (ADMIN/EDITOR)');
      console.log('  DELETE /api/v1/stations/:id (ADMIN)');
      console.log('  POST /api/v1/range/calc');
      console.log('  POST /api/v1/auth/register');
      console.log('  POST /api/v1/auth/login');
      console.log('  POST /api/v1/auth/refresh');
      console.log('  POST /api/v1/auth/logout');
      console.log('  GET  /api/v1/users (ADMIN only)');
      console.log('  POST /api/v1/users (ADMIN only)');
      console.log('  PUT  /api/v1/users/:id (ADMIN only)');
      console.log('  DELETE /api/v1/users/:id (ADMIN only)');
    });
  })
  .catch(console.error);
