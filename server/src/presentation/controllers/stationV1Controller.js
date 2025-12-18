const { stationService } = require('../../application/services/stationService');
const { okResponse } = require('../../utils/apiResponse');
const { AppError } = require('../../utils/errors');
const multer = require('multer');

// Configure multer for CSV file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const stationV1Controller = {
  async listStations(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const search = req.query.search;
      const minPowerKw = req.query.minPowerKw ? Number(req.query.minPowerKw) : undefined;
      const open247 =
        typeof req.query.open247 === 'string' ? req.query.open247 === 'true' : undefined;

      const result = await stationService.listStationsV1({
        page,
        limit,
        search,
        minPowerKw,
        open247,
      });

      return res.json(okResponse(result.data, result.meta));
    } catch (err) {
      return next(err);
    }
  },

  async getStationById(req, res, next) {
    try {
      const station = await stationService.getStationByIdV1(req.params.id);
      return res.json(okResponse(station));
    } catch (err) {
      return next(err);
    }
  },

  async getNearestStations(req, res, next) {
    try {
      const { lat, lng, limit = 10 } = req.query;

      if (!lat || !lng) {
        throw new AppError('VALIDATION_ERROR', 'lat and lng required', 400);
      }

      const stations = await stationService.getNearestV1({
        lat: Number(lat),
        lng: Number(lng),
        limit: Number(limit) || 10,
      });

      return res.json(okResponse(stations));
    } catch (err) {
      return next(err);
    }
  },

  async getStationsInRange(req, res, next) {
    try {
      const { lat, lng, rangeKm } = req.query;

      if (!lat || !lng || !rangeKm) {
        throw new AppError('VALIDATION_ERROR', 'lat, lng and rangeKm required', 400);
      }

      const stations = await stationService.getInRangeV1({
        lat: Number(lat),
        lng: Number(lng),
        radiusKm: Number(rangeKm),
      });

      return res.json(okResponse(stations));
    } catch (err) {
      return next(err);
    }
  },

  async create(req, res, next) {
    try {
      const station = await stationService.createStationV1(req.body);
      return res.status(201).json(okResponse(station));
    } catch (err) {
      return next(err);
    }
  },

  async update(req, res, next) {
    try {
      const station = await stationService.updateStationV1(req.params.id, req.body);
      return res.status(200).json(okResponse(station));
    } catch (err) {
      return next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await stationService.deleteStationV1(req.params.id);
      return res.status(200).json(okResponse({ message: 'Station deleted successfully' }));
    } catch (err) {
      return next(err);
    }
  },

  async importCSV(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('VALIDATION_ERROR', 'CSV file is required', 400);
      }

      const csvContent = req.file.buffer.toString('utf8');
      const result = await stationService.importStationsFromCSV(csvContent);

      return res.status(200).json(
        okResponse(result, {
          message: `Imported ${result.success} of ${result.total} stations`,
        }),
      );
    } catch (err) {
      return next(err);
    }
  },
};

// Export multer middleware for use in routes
const uploadCSV = upload.single('file');

module.exports = { stationV1Controller, uploadCSV };
