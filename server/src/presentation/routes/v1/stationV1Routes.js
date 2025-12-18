const express = require('express');
const { stationV1Controller, uploadCSV } = require('../../controllers/stationV1Controller');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/', stationV1Controller.listStations);
router.get('/nearest', stationV1Controller.getNearestStations);
router.get('/in-range', stationV1Controller.getStationsInRange);
router.get('/:id', stationV1Controller.getStationById);

// Protected routes (require ADMIN or EDITOR)
// Note: import-csv must be before /:id to avoid route conflict
router.post('/import-csv', authMiddleware, requireRole('ADMIN', 'EDITOR'), uploadCSV, stationV1Controller.importCSV);
router.post('/', authMiddleware, requireRole('ADMIN', 'EDITOR'), stationV1Controller.create);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'EDITOR'), stationV1Controller.update);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), stationV1Controller.delete);

module.exports = { stationV1Router: router };


