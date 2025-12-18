const { rangeService } = require('../../application/services/rangeService');
const { okResponse } = require('../../utils/apiResponse');
const { AppError } = require('../../utils/errors');

const rangeController = {
  async calculateRange(req, res, next) {
    try {
      const { batteryPercent, capacityKwh, consumptionKwhPerKm } = req.body || {};

      // Simple validation (có thể thay bằng Zod/Joi sau)
      if (
        batteryPercent === undefined ||
        capacityKwh === undefined ||
        consumptionKwhPerKm === undefined
      ) {
        throw new AppError('VALIDATION_ERROR', 'Missing parameters', 400, [
          'batteryPercent, capacityKwh, consumptionKwhPerKm are required',
        ]);
      }

      const result = await rangeService.calculateRange({
        batteryPercent: Number(batteryPercent),
        capacityKwh: Number(capacityKwh),
        consumptionKwhPerKm: Number(consumptionKwhPerKm),
      });

      return res.status(200).json(okResponse(result));
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { rangeController };


