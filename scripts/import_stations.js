/**
 * Script to import EV charging stations from CSV to MongoDB Atlas
 * 
 * Usage:
 * 1. npm install mongodb
 * 2. Update MONGODB_URI with your password
 * 3. Add station data to data/stations_template.csv
 * 4. node scripts/import_stations.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// ============ CONFIG ============
const MONGODB_URI = 'mongodb+srv://luquoruswork_db_user:luquorus@cluster0.i4bwlfm.mongodb.net/?appName=Cluster0';
const DB_NAME = 'ev_charging';
const COLLECTION_NAME = 'stations';
// ================================

// Port types definition
const PORT_TYPES = [
  { column: 'ports_250kw', powerKw: 250, category: 'superfast' },  // 250-360kW
  { column: 'ports_180kw', powerKw: 180, category: 'superfast' },
  { column: 'ports_150kw', powerKw: 150, category: 'superfast' },
  { column: 'ports_120kw', powerKw: 120, category: 'superfast' },
  { column: 'ports_80kw', powerKw: 80, category: 'fast' },
  { column: 'ports_60kw', powerKw: 60, category: 'fast' },
  { column: 'ports_40kw', powerKw: 40, category: 'normal' },       // 20-40kW
  { column: 'ports_ac', powerKw: 7, category: 'slow' },            // AC slow charging
];

// Parse CSV file
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

// Convert CSV row to MongoDB document format
function convertToMongoFormat(csvData) {
  return csvData.map(row => {
    const ports = [];
    
    // Parse all port types
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
    
    return {
      name: row.name,
      address: row.address,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(row.longitude),  // GeoJSON: [lng, lat]
          parseFloat(row.latitude)
        ]
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

async function importFromCSV() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected successfully!\n');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../data/stations_template.csv');
    console.log(`Reading file: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse and convert
    const csvData = parseCSV(csvContent);
    const stations = convertToMongoFormat(csvData);
    
    console.log(`Found ${stations.length} stations in CSV\n`);
    
    if (stations.length === 0) {
      console.log('No data to import!');
      return;
    }

    // Preview data
    console.log('Data Preview:');
    console.log('='.repeat(60));
    stations.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name}`);
      console.log(`   Address: ${s.address}`);
      console.log(`   Coords: ${s.location.coordinates[1]}, ${s.location.coordinates[0]}`);
      console.log(`   Ports: ${s.ports.map(p => `${p.quantity}x${p.powerKw}kW`).join(', ') || 'None'}`);
      console.log(`   Total: ${s.totalPorts} ports | Max: ${s.maxPowerKw}kW`);
      console.log(`   Hours: ${s.operatingHours} | Parking: ${s.parking}`);
      console.log('');
    });
    console.log('='.repeat(60));
    
    // Insert data
    console.log('\nImporting to MongoDB...');
    const result = await collection.insertMany(stations);
    console.log(`Imported ${result.insertedCount} stations!`);
    
    // Create geospatial index
    console.log('Creating geospatial index...');
    await collection.createIndex({ location: '2dsphere' });
    console.log('Index created for location search!\n');
    
    // Stats
    const totalCount = await collection.countDocuments();
    console.log(`Total stations in database: ${totalCount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\nHint: Check your MongoDB Atlas password');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('\nHint: Check your internet connection');
    }
    if (error.message.includes('duplicate key')) {
      console.log('\nHint: Some stations may already exist in database');
    }
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run script
importFromCSV();
