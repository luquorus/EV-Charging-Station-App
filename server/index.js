/**
 * EV Charging Stations API Server
 * 
 * Endpoints:
 * - GET /api/stations - Get all stations
 * - GET /api/stations/nearest?lat=&lng=&limit= - Get nearest stations
 * - GET /api/stations/in-range?lat=&lng=&radius= - Get stations within radius (km)
 * - GET /api/stations/:id - Get station by ID
 * - POST /api/utils/range - Calculate driving range
 */

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB config
const MONGODB_URI = 'mongodb+srv://luquoruswork_db_user:luquorus@cluster0.i4bwlfm.mongodb.net/?appName=Cluster0';
const DB_NAME = 'ev_charging';

let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB');
}

// ============ API ROUTES ============

// GET /api/stations - Get all stations
app.get('/api/stations', async (req, res) => {
  try {
    const stations = await db.collection('stations').find({}).toArray();
    
    // Transform for Flutter app (flatten location)
    const result = stations.map(s => ({
      _id: s._id,
      name: s.name,
      address: s.address,
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      ports: s.ports,
      totalPorts: s.totalPorts,
      maxPowerKw: s.maxPowerKw,
      operatingHours: s.operatingHours,
      parking: s.parking,
      stationType: s.stationType,
      status: s.status
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stations/nearest - Get nearest stations
app.get('/api/stations/nearest', async (req, res) => {
  try {
    const { lat, lng, limit = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng required' });
    }
    
    const stations = await db.collection('stations').find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      }
    }).limit(parseInt(limit)).toArray();
    
    const result = stations.map(s => ({
      _id: s._id,
      name: s.name,
      address: s.address,
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      ports: s.ports,
      totalPorts: s.totalPorts,
      maxPowerKw: s.maxPowerKw,
      operatingHours: s.operatingHours,
      parking: s.parking,
      stationType: s.stationType,
      status: s.status,
      distance: calculateDistance(
        parseFloat(lat), parseFloat(lng),
        s.location.coordinates[1], s.location.coordinates[0]
      )
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stations/in-range - Get stations within radius
app.get('/api/stations/in-range', async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query; // radius in km
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng required' });
    }
    
    const radiusMeters = parseFloat(radius) * 1000;
    
    const stations = await db.collection('stations').find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            radiusMeters / 6378100 // Convert to radians
          ]
        }
      }
    }).toArray();
    
    const result = stations.map(s => ({
      _id: s._id,
      name: s.name,
      address: s.address,
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      ports: s.ports,
      totalPorts: s.totalPorts,
      maxPowerKw: s.maxPowerKw,
      operatingHours: s.operatingHours,
      parking: s.parking,
      stationType: s.stationType,
      status: s.status,
      distance: calculateDistance(
        parseFloat(lat), parseFloat(lng),
        s.location.coordinates[1], s.location.coordinates[0]
      )
    }));
    
    // Sort by distance
    result.sort((a, b) => a.distance - b.distance);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stations/:id - Get station by ID
app.get('/api/stations/:id', async (req, res) => {
  try {
    const station = await db.collection('stations').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json({
      _id: station._id,
      name: station.name,
      address: station.address,
      lat: station.location.coordinates[1],
      lng: station.location.coordinates[0],
      ports: station.ports,
      totalPorts: station.totalPorts,
      maxPowerKw: station.maxPowerKw,
      operatingHours: station.operatingHours,
      parking: station.parking,
      stationType: station.stationType,
      status: station.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/utils/range - Calculate driving range
app.post('/api/utils/range', (req, res) => {
  try {
    const { batteryPercent, batteryCapacityKwh, consumptionKwhPerKm } = req.body;
    
    if (!batteryPercent || !batteryCapacityKwh || !consumptionKwhPerKm) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    const currentEnergyKwh = (batteryPercent / 100) * batteryCapacityKwh;
    const maxDistanceKm = currentEnergyKwh / consumptionKwhPerKm;
    
    res.json({
      maxDistanceKm: Math.round(maxDistanceKm * 10) / 10,
      currentEnergyKwh: Math.round(currentEnergyKwh * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('\nAvailable endpoints:');
    console.log('  GET  /api/stations');
    console.log('  GET  /api/stations/nearest?lat=&lng=&limit=');
    console.log('  GET  /api/stations/in-range?lat=&lng=&radius=');
    console.log('  GET  /api/stations/:id');
    console.log('  POST /api/utils/range');
  });
}).catch(console.error);

