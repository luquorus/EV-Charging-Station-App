/**
 * Script chuyển đổi CSV sang JSON format cho MongoDB
 * 
 * Cách sử dụng:
 * 1. Mở file data/stations_template.csv bằng Excel
 * 2. Thêm dữ liệu các trạm sạc
 * 3. Save lại (giữ định dạng CSV)
 * 4. Chạy: node scripts/csv_to_json.js
 * 5. File data/stations_sample.json sẽ được tạo/cập nhật
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/stations_template.csv');
const jsonPath = path.join(__dirname, '../data/stations_sample.json');

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
    
    // Parse các loại cổng sạc
    if (parseInt(row.ports_120kw) > 0) {
      ports.push({ quantity: parseInt(row.ports_120kw), powerKw: 120 });
    }
    if (parseInt(row.ports_60kw) > 0) {
      ports.push({ quantity: parseInt(row.ports_60kw), powerKw: 60 });
    }
    if (parseInt(row.ports_30kw) > 0) {
      ports.push({ quantity: parseInt(row.ports_30kw), powerKw: 30 });
    }
    
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
      operatingHours: row.operatingHours || '24/7',
      parking: row.parking || 'Không rõ',
      stationType: row.stationType || 'Công cộng',
      status: row.status || 'active',
      updatedAt: new Date().toISOString()
    };
  });
}

// Main
try {
  console.log('📖 Đang đọc file CSV...');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  console.log('🔄 Đang chuyển đổi...');
  const csvData = parseCSV(csvContent);
  const mongoData = convertToMongoFormat(csvData);
  
  console.log('💾 Đang lưu file JSON...');
  fs.writeFileSync(jsonPath, JSON.stringify(mongoData, null, 2), 'utf8');
  
  console.log(`\n✅ Hoàn thành! Đã chuyển đổi ${mongoData.length} trạm sạc.`);
  console.log(`📁 File output: ${jsonPath}`);
  
  console.log('\n📋 Preview dữ liệu:');
  mongoData.forEach((station, i) => {
    console.log(`${i + 1}. ${station.name}`);
    console.log(`   📍 Tọa độ: ${station.location.coordinates[1]}, ${station.location.coordinates[0]}`);
    console.log(`   🔌 Cổng sạc: ${station.ports.map(p => `${p.quantity}x${p.powerKw}kW`).join(', ')}`);
  });
  
  console.log('\n🚀 Tiếp theo chạy: node scripts/import_stations.js');
  
} catch (error) {
  console.error('❌ Lỗi:', error.message);
}

