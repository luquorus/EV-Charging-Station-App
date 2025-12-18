const { AppError } = require('../../utils/errors');

const rangeService = {
  async calculateRange({ batteryPercent, capacityKwh, consumptionKwhPerKm }) {
    if (
      Number.isNaN(batteryPercent) ||
      Number.isNaN(capacityKwh) ||
      Number.isNaN(consumptionKwhPerKm)
    ) {
      throw new AppError('VALIDATION_ERROR', 'Parameters must be numbers', 400);
    }

    if (batteryPercent <= 0 || capacityKwh <= 0 || consumptionKwhPerKm <= 0) {
      throw new AppError('VALIDATION_ERROR', 'Parameters must be positive', 400);
    }

    const currentEnergyKwh = (batteryPercent / 100) * capacityKwh;
    const maxDistanceKm = currentEnergyKwh / consumptionKwhPerKm;

    return {
      rangeKm: Math.round(maxDistanceKm * 10) / 10,
      currentEnergyKwh: Math.round(currentEnergyKwh * 10) / 10,
    };
  },
};

module.exports = { rangeService };


