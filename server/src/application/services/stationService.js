const { stationRepository } = require('../../domain/repositories/stationRepository');
const { AppError } = require('../../utils/errors');
const { calculateDistanceKm } = require('../../utils/geo');

function mapDocToV1Dto(doc) {
  return {
    id: doc._id,
    _id: doc._id, // Keep _id for compatibility
    name: doc.name,
    address: doc.address,
    lat: doc.location.coordinates[1],
    lng: doc.location.coordinates[0],
    location: doc.location, // Include full location object
    // V1 format (for mobile app)
    chargers: (doc.ports || []).map((p) => ({
      powerKw: p.powerKw,
      quantity: p.quantity,
      connectorType: p.connectorType || null,
    })),
    open247: doc.operatingHours === '24/7',
    parkingFeeNote: doc.parking || '',
    operator: doc.operator || null,
    lastUpdatedAt: doc.updatedAt || doc.createdAt,
    // Admin panel format (include all fields)
    ports: doc.ports || [],
    totalPorts: doc.totalPorts || 0,
    maxPowerKw: doc.maxPowerKw || 0,
    operatingHours: doc.operatingHours || '24/7',
    parking: doc.parking || 'Unknown',
    stationType: doc.stationType || 'public',
    status: doc.status || 'active',
  };
}

const PORT_TYPES = [
  { column: 'ports_250kw', powerKw: 250, category: 'superfast' },
  { column: 'ports_180kw', powerKw: 180, category: 'superfast' },
  { column: 'ports_150kw', powerKw: 150, category: 'superfast' },
  { column: 'ports_120kw', powerKw: 120, category: 'superfast' },
  { column: 'ports_80kw', powerKw: 80, category: 'fast' },
  { column: 'ports_60kw', powerKw: 60, category: 'fast' },
  { column: 'ports_40kw', powerKw: 40, category: 'normal' },
  { column: 'ports_ac', powerKw: 7, category: 'slow' },
];

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  return data;
}

function convertCSVToStations(csvData) {
  return csvData.map((row) => {
    const ports = [];

    PORT_TYPES.forEach((portType) => {
      const quantity = parseInt(row[portType.column]) || 0;
      if (quantity > 0) {
        ports.push({
          quantity: quantity,
          powerKw: portType.powerKw,
          category: portType.category,
        });
      }
    });

    return {
      name: row.name,
      address: row.address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
      },
      ports: ports,
      totalPorts: ports.reduce((sum, p) => sum + p.quantity, 0),
      maxPowerKw: ports.length > 0 ? Math.max(...ports.map((p) => p.powerKw)) : 0,
      operatingHours: row.operatingHours || '24/7',
      parking: row.parking || 'Unknown',
      stationType: row.stationType || 'public',
      status: row.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

const stationService = {
  async listStationsV1({ page, limit, search, minPowerKw, open247 }) {
    const { docs, total } = await stationRepository.findManyWithFilters({
      page,
      limit,
      search,
      minPowerKw,
      open247,
    });

    return {
      data: docs.map(mapDocToV1Dto),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getStationByIdV1(id) {
    const doc = await stationRepository.findById(id);
    if (!doc) {
      throw new AppError('NOT_FOUND', 'Station not found', 404);
    }
    return mapDocToV1Dto(doc);
  },

  async getNearestV1({ lat, lng, limit = 10 }) {
    const docs = await stationRepository.findNearest({ lat, lng, limit });
    return docs.map((doc) => {
      const base = mapDocToV1Dto(doc);
      const distance = calculateDistanceKm(
        Number(lat),
        Number(lng),
        base.lat,
        base.lng,
      );
      return {
        ...base,
        distanceKm: Math.round(distance * 10) / 10,
      };
    });
  },

  async getInRangeV1({ lat, lng, radiusKm }) {
    const docs = await stationRepository.findInRange({ lat, lng, radiusKm });
    const listWithDistance = docs.map((doc) => {
      const base = mapDocToV1Dto(doc);
      const distance = calculateDistanceKm(
        Number(lat),
        Number(lng),
        base.lat,
        base.lng,
      );
      return {
        ...base,
        distanceKm: Math.round(distance * 10) / 10,
      };
    });

    listWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    return listWithDistance;
  },

  async createStationV1(stationData) {
    // Validate required fields
    if (!stationData.name || !stationData.address || !stationData.location) {
      throw new AppError('VALIDATION_ERROR', 'Name, address, and location are required', 400);
    }

    // Calculate totalPorts and maxPowerKw if not provided
    if (stationData.ports && Array.isArray(stationData.ports)) {
      if (!stationData.totalPorts) {
        stationData.totalPorts = stationData.ports.reduce((sum, p) => sum + (p.quantity || 0), 0);
      }
      if (!stationData.maxPowerKw && stationData.ports.length > 0) {
        stationData.maxPowerKw = Math.max(...stationData.ports.map((p) => p.powerKw || 0));
      }
    }

    const doc = await stationRepository.create(stationData);
    return mapDocToV1Dto(doc);
  },

  async updateStationV1(id, updates) {
    // Recalculate totalPorts and maxPowerKw if ports are updated
    if (updates.ports && Array.isArray(updates.ports)) {
      updates.totalPorts = updates.ports.reduce((sum, p) => sum + (p.quantity || 0), 0);
      if (updates.ports.length > 0) {
        updates.maxPowerKw = Math.max(...updates.ports.map((p) => p.powerKw || 0));
      }
    }

    const doc = await stationRepository.update(id, updates);
    if (!doc) {
      throw new AppError('NOT_FOUND', 'Station not found', 404);
    }
    return mapDocToV1Dto(doc);
  },

  async deleteStationV1(id) {
    const doc = await stationRepository.findById(id);
    if (!doc) {
      throw new AppError('NOT_FOUND', 'Station not found', 404);
    }
    await stationRepository.deleteById(id);
  },

  async importStationsFromCSV(csvContent) {
    const csvData = parseCSV(csvContent);
    const stations = convertCSVToStations(csvData);

    if (stations.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'No valid stations found in CSV', 400);
    }

    // Insert all stations
    const results = [];
    for (const station of stations) {
      try {
        const doc = await stationRepository.create(station);
        results.push({ success: true, station: mapDocToV1Dto(doc) });
      } catch (err) {
        results.push({ success: false, error: err.message, station: station.name });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return {
      total: stations.length,
      success: successCount,
      failed: stations.length - successCount,
      results,
    };
  },
};

module.exports = { stationService };
