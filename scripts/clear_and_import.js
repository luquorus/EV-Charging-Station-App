/**
 * Clear existing data and re-import from CSV
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://luquoruswork_db_user:luquorus@cluster0.i4bwlfm.mongodb.net/?appName=Cluster0';
const DB_NAME = 'ev_charging';
const COLLECTION_NAME = 'stations';

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

function convertToMongoFormat(csvData) {
  return csvData.map(row => {
    const ports = [];
    PORT_TYPES.forEach(portType => {
      const quantity = parseInt(row[portType.column]) || 0;
      if (quantity > 0) {
        ports.push({
          quantity: quantity,
          powerKw: portType.powerKw,
          category: portType.category
        });
      }
    });
    
    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);
    
    return {
      name: row.name,
      address: row.address,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      ports: ports,
      totalPorts: ports.reduce((sum, p) => sum + p.quantity, 0),
      maxPowerKw: ports.length > 0 ? Math.max(...ports.map(p => p.powerKw)) : 0,
      operatingHours: row.operatingHours || '24/7',
      parking: row.parking || 'Unknown',
      stationType: row.stationType || 'Public',
      status: row.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
}

async function clearAndImport() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected!\n');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Clear existing data
    console.log('Clearing existing data...');
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} documents\n`);
    
    // Read and parse CSV
    const csvPath = path.join(__dirname, '../data/stations_template.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const csvData = parseCSV(csvContent);
    const stations = convertToMongoFormat(csvData);
    
    // Validate data
    const validStations = stations.filter(s => {
      const lng = s.location.coordinates[0];
      const lat = s.location.coordinates[1];
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
    
    console.log(`Found ${stations.length} stations, ${validStations.length} valid\n`);
    
    // Insert
    const result = await collection.insertMany(validStations);
    console.log(`Imported ${result.insertedCount} stations!`);
    
    // Create index
    console.log('Creating geospatial index...');
    await collection.createIndex({ location: '2dsphere' });
    console.log('Index created!\n');
    
    // Stats
    const count = await collection.countDocuments();
    console.log(`Total stations in database: ${count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('\nDone!');
  }
}

clearAndImport();

