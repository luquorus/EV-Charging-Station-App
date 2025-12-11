# 📋 BÁO CÁO TIẾN ĐỘ DỰ ÁN TUẦN X

## 📱 Dự án: EV Charging Station App
**Ngày báo cáo:** Thứ 5, ngày 11/12/2025  
**Thành viên:** [Tên thành viên]  
**Môn học:** [Tên môn học / GR2]

---

## 1️⃣ TỔNG QUAN CÔNG VIỆC TUẦN NÀY

### 🎯 Mục tiêu tuần
- Xây dựng ứng dụng EV Charging Station từ đầu (from scratch)
- Thiết kế kiến trúc theo các nguyên tắc phần mềm (SOLID, OOP, Separation of Concerns)
- Xây dựng Backend API với Node.js + MongoDB
- Xây dựng Frontend Mobile App với Flutter
- Import dữ liệu 61 trạm sạc EV tại Hà Nội và vùng lân cận

### ✅ Kết quả đạt được
| Hạng mục | Trạng thái | Ghi chú |
|----------|------------|---------|
| Lựa chọn công nghệ | ✅ Hoàn thành | Flutter + Node.js + MongoDB |
| Thiết kế kiến trúc | ✅ Hoàn thành | MVC + Clean Architecture |
| Backend API | ✅ Hoàn thành | 5 endpoints |
| Frontend Flutter App | ✅ Hoàn thành | 15 files, ~1500 dòng code |
| Database | ✅ Hoàn thành | MongoDB Atlas + GeoSpatial Index |
| Import dữ liệu | ✅ Hoàn thành | 61 trạm sạc |

---

## 2️⃣ CÔNG NGHỆ ĐÃ CHỌN

### 2.1. Tổng quan kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EV CHARGING STATION APP                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │   FRONTEND      │     │    BACKEND      │     │    DATABASE     │   │
│  │   Flutter App   │ ←→  │  Node.js API    │ ←→  │  MongoDB Atlas  │   │
│  │   (Dart)        │     │  (Express.js)   │     │  (Cloud)        │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│         ↓                        ↓                       ↓              │
│   Google Maps SDK          REST API              GeoSpatial Query      │
│   Geolocator               CORS enabled          2dsphere Index        │
│   Dio HTTP Client          JSON Response         NoSQL Document        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2. Frontend - Flutter

| Thông tin | Chi tiết |
|-----------|----------|
| **Framework** | Flutter 3.x |
| **Ngôn ngữ** | Dart (SDK ^3.10.1) |
| **IDE** | Cursor / VS Code |
| **Target platforms** | Android, iOS, Windows, Web |

#### 📦 Dependencies (pubspec.yaml)

| Package | Version | Mục đích |
|---------|---------|----------|
| `flutter` | SDK | Framework chính |
| `google_maps_flutter` | ^2.9.0 | Hiển thị bản đồ Google Maps |
| `geolocator` | ^14.0.2 | Lấy vị trí GPS người dùng |
| `dio` | ^5.7.0 | HTTP Client gọi API |
| `provider` | ^6.1.2 | State management (dự phòng) |
| `cupertino_icons` | ^1.0.8 | Icons iOS style |

#### Tại sao chọn Flutter?

| Tiêu chí | Flutter | React Native | Native (Kotlin/Swift) |
|----------|---------|--------------|----------------------|
| **Cross-platform** | ✅ 1 codebase | ✅ 1 codebase | ❌ 2 codebases |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **UI Customization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Curve** | Trung bình | Dễ (nếu biết JS) | Khó |
| **Hot Reload** | ✅ Có | ✅ Có | ❌ Chậm |
| **Google Maps Support** | ✅ Tốt | ✅ Tốt | ✅ Native |

**Kết luận:** Flutter được chọn vì:
- Viết 1 lần, chạy trên nhiều platform
- Hot reload giúp phát triển nhanh
- Google Maps Flutter plugin hoạt động tốt
- Dart dễ học, typed language tránh bugs

---

### 2.3. Backend - Node.js

| Thông tin | Chi tiết |
|-----------|----------|
| **Runtime** | Node.js |
| **Framework** | Express.js 5.x |
| **Port** | 3000 |

#### 📦 Dependencies (package.json)

| Package | Version | Mục đích |
|---------|---------|----------|
| `express` | ^5.2.1 | Web framework, routing |
| `mongodb` | ^7.0.0 | MongoDB driver |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `dotenv` | ^17.2.3 | Environment variables |

#### Tại sao chọn Node.js + Express?

| Tiêu chí | Node.js | Python Flask | Java Spring |
|----------|---------|--------------|-------------|
| **Tốc độ phát triển** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Performance I/O** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **JSON handling** | ⭐⭐⭐⭐⭐ (native) | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Ecosystem** | ⭐⭐⭐⭐⭐ (npm) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Curve** | Dễ | Dễ | Khó |

**Kết luận:** Node.js được chọn vì:
- JavaScript chạy cả frontend lẫn backend (fullstack JS)
- JSON là native trong JavaScript
- Non-blocking I/O phù hợp với API calls nhiều
- Express.js nhẹ, dễ setup

---

### 2.4. Database - MongoDB Atlas

| Thông tin | Chi tiết |
|-----------|----------|
| **Database** | MongoDB |
| **Deployment** | MongoDB Atlas (Cloud) |
| **Type** | NoSQL Document Database |

#### Tại sao chọn MongoDB?

| Tiêu chí | MongoDB | PostgreSQL | MySQL |
|----------|---------|------------|-------|
| **Schema** | Flexible (schemaless) | Rigid | Rigid |
| **GeoSpatial Query** | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐⭐ PostGIS | ⭐⭐⭐ |
| **JSON Storage** | ⭐⭐⭐⭐⭐ Native (BSON) | ⭐⭐⭐ JSONB | ⭐⭐ |
| **Horizontal Scaling** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Cloud Hosting Free** | ✅ Atlas Free Tier | ❌ Limited | ❌ Limited |

**Kết luận:** MongoDB được chọn vì:
- **GeoSpatial queries native**: Tìm trạm gần nhất, trong bán kính
- **Flexible schema**: Mỗi trạm có thể có số cổng khác nhau
- **Atlas Free Tier**: Miễn phí 512MB storage
- **2dsphere Index**: Index tối ưu cho tọa độ GPS

#### Cấu trúc Document trong MongoDB

```javascript
{
  "_id": ObjectId("..."),
  "name": "Vincom Plaza Long Bien",
  "address": "Long Bien District, Hanoi",
  "location": {
    "type": "Point",
    "coordinates": [105.91581, 21.05052]  // [lng, lat] - GeoJSON format
  },
  "ports": [
    { "quantity": 4, "powerKw": 250, "category": "superfast" },
    { "quantity": 8, "powerKw": 120, "category": "superfast" },
    { "quantity": 1, "powerKw": 7, "category": "slow" }
  ],
  "totalPorts": 13,
  "maxPowerKw": 250,
  "operatingHours": "24/7",
  "parking": "Paid",
  "status": "active"
}
```

---

### 2.5. APIs và Thư viện bên ngoài

| API/Service | Mục đích | Ghi chú |
|-------------|----------|---------|
| **Google Maps Platform** | Hiển thị bản đồ, markers | Cần API Key |
| **Geolocator** | Lấy GPS location | Permission required |
| **MongoDB Atlas** | Cloud database | Free tier 512MB |

---

### 2.6. Công cụ phát triển

| Công cụ | Mục đích |
|---------|----------|
| **Cursor IDE** | Code editor chính |
| **Git** | Version control |
| **Postman** | Test API |
| **MongoDB Compass** | GUI cho MongoDB |
| **Android Studio** | Android emulator |
| **Chrome DevTools** | Debug web version |

---

## 3️⃣ CHI TIẾT CÔNG VIỆC ĐÃ THỰC HIỆN

### 📁 3.1. Xây dựng Backend API

#### File: `server/index.js`

**API Endpoints đã tạo:**

| Method | Endpoint | Mô tả | Query Params |
|--------|----------|-------|--------------|
| GET | `/api/stations` | Lấy tất cả trạm | - |
| GET | `/api/stations/nearest` | Tìm trạm gần nhất | `lat`, `lng`, `limit` |
| GET | `/api/stations/in-range` | Tìm trạm trong bán kính | `lat`, `lng`, `radius` |
| GET | `/api/stations/:id` | Lấy trạm theo ID | - |
| POST | `/api/utils/range` | Tính quãng đường | Body: battery info |

**Code ví dụ - Tìm trạm gần nhất:**

```javascript
app.get('/api/stations/nearest', async (req, res) => {
  const { lat, lng, limit = 10 } = req.query;
  
  // MongoDB GeoSpatial Query - $near operator
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
  
  res.json(stations);
});
```

**Giải thích:**
- `$near`: MongoDB operator tìm documents gần một điểm nhất
- `$geometry`: Chỉ định điểm tham chiếu theo chuẩn GeoJSON
- Kết quả tự động sắp xếp theo khoảng cách gần → xa

---

### 📁 3.2. Xây dựng Flutter App - Models

#### 📄 File: `lib/models/station.dart`
**Mục đích:** Đại diện cho một trạm sạc EV

```dart
class Station {
  final String id;
  final String name;
  final String address;
  final double lat;           // Latitude (vĩ độ)
  final double lng;           // Longitude (kinh độ)
  final int totalPorts;       // Tổng số cổng
  final int maxPowerKw;       // Công suất max
  final List<Port> ports;     // Danh sách cổng sạc
  final String operatingHours;
  final String parking;
  final double? distance;     // Khoảng cách từ user (nullable)

  factory Station.fromJson(Map<String, dynamic> json) {
    return Station(
      id: json['_id']?.toString() ?? '${json['lat']}_${json['lng']}',
      name: json['name'] ?? 'Unknown Station',
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      // ... parse các field khác
    );
  }

  PowerCategory get powerCategory {
    if (maxPowerKw >= 150) return PowerCategory.superfast;
    if (maxPowerKw >= 60) return PowerCategory.fast;
    return PowerCategory.normal;
  }
}

enum PowerCategory {
  superfast,  // 150+ kW (xanh lá)
  fast,       // 60-149 kW (xanh dương)
  normal,     // < 60 kW (cam)
}
```

**Giải thích cho người mới:**
- `class`: Định nghĩa một kiểu dữ liệu mới trong Dart
- `final`: Biến chỉ gán giá trị 1 lần (immutable) - giúp code an toàn hơn
- `factory`: Constructor đặc biệt, thường dùng để parse JSON
- `fromJson()`: Method chuyển dữ liệu JSON từ API thành object Dart
- `List<Port>`: Danh sách các object Port (typed list)
- `double?`: Kiểu nullable - có thể là null
- `get`: Getter - property tính toán tự động khi truy cập
- `enum`: Kiểu liệt kê - giới hạn các giá trị có thể có

---

#### 📄 File: `lib/models/port.dart`
**Mục đích:** Đại diện cho một cổng sạc

```dart
class Port {
  final String type;      // Loại cổng (CCS, CHAdeMO...)
  final int quantity;     // Số lượng
  final int powerKw;      // Công suất (kW)

  const Port({
    required this.type,
    required this.quantity,
    required this.powerKw,
  });

  factory Port.fromJson(Map<String, dynamic> json) {
    return Port(
      type: json['type'] ?? '',
      quantity: json['quantity'] ?? 0,
      powerKw: json['powerKw'] ?? 0,
    );
  }
}
```

**Giải thích:**
- `const`: Constructor có thể tạo compile-time constant
- `required`: Tham số bắt buộc phải truyền khi tạo object
- `this.type`: Shorthand để gán tham số vào field cùng tên

---

#### 📄 File: `lib/models/battery_info.dart`
**Mục đích:** Lưu thông tin pin để tính quãng đường

```dart
class BatteryInfo {
  final double batteryPercent;        // % pin hiện tại
  final double capacityKwh;           // Dung lượng pin (kWh)
  final double consumptionKwhPerKm;   // Mức tiêu thụ (kWh/km)

  // Factory constructor với giá trị mặc định
  factory BatteryInfo.defaults() {
    return const BatteryInfo(
      batteryPercent: 50.0,
      capacityKwh: 50.0,
      consumptionKwhPerKm: 0.15,
    );
  }

  // Getter kiểm tra dữ liệu hợp lệ
  bool get isValid =>
      batteryPercent > 0 && capacityKwh > 0 && consumptionKwhPerKm > 0;

  // Getter tính quãng đường ước tính
  double get estimatedRangeKm {
    if (!isValid) return 0;
    final availableEnergy = (batteryPercent / 100) * capacityKwh;
    return availableEnergy / consumptionKwhPerKm;
  }
}
```

**Công thức tính range:**
```
Quãng đường (km) = (% pin × Dung lượng kWh) / Mức tiêu thụ (kWh/km)
Ví dụ: (50% × 50kWh) / 0.15 = 166.7 km
```

---

### 📁 3.3. Xây dựng Services

#### 📄 File: `lib/services/location_service.dart`
**Mục đích:** Đóng gói toàn bộ logic GPS

```dart
/// Kết quả của thao tác location - Result Pattern
class LocationResult {
  final LatLng? position;
  final String? error;
  final bool success;

  factory LocationResult.success(LatLng position) {
    return LocationResult._(position: position, success: true);
  }

  factory LocationResult.failure(String error) {
    return LocationResult._(error: error, success: false);
  }
}

/// Service xử lý location
class LocationService {
  static const LatLng defaultLocation = LatLng(21.0278, 105.8342); // Hà Nội

  /// Kiểm tra và yêu cầu permission GPS
  Future<LocationResult> checkPermissions() async {
    // 1. Kiểm tra GPS có bật không
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return LocationResult.failure('Please enable GPS');
    }

    // 2. Kiểm tra permission
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return LocationResult.failure('Permission denied');
      }
    }

    return LocationResult.success(defaultLocation);
  }

  /// Lấy vị trí hiện tại
  Future<LocationResult> getCurrentPosition() async {
    final permResult = await checkPermissions();
    if (!permResult.success) return permResult;

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return LocationResult.success(LatLng(position.latitude, position.longitude));
    } catch (e) {
      return LocationResult.failure('Could not get location: $e');
    }
  }

  /// Tính khoảng cách giữa 2 điểm (km)
  double distanceBetween(LatLng from, LatLng to) {
    return Geolocator.distanceBetween(
      from.latitude, from.longitude,
      to.latitude, to.longitude,
    ) / 1000;
  }
}
```

**Giải thích:**
- **Result Pattern**: Thay vì throw exception, trả về object với success/failure
- `static const`: Hằng số cấp class - truy cập qua `LocationService.defaultLocation`
- `Future<T>`: Đại diện cho giá trị sẽ có trong tương lai (async)
- `async/await`: Cú pháp xử lý bất đồng bộ dễ đọc

---

#### 📄 File: `lib/services/api_service.dart`
**Mục đích:** Xử lý gọi API đến backend

```dart
class ApiService {
  late final Dio _dio;

  ApiService() {
    // Tự động chọn URL theo platform
    String baseUrl;
    if (kIsWeb) {
      baseUrl = 'http://localhost:3000';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:3000';  // Android emulator đặc biệt
    } else {
      baseUrl = 'http://localhost:3000';  // iOS, Windows, macOS
    }
    
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
    ));
  }

  /// Lấy tất cả trạm - trả về typed List<Station>
  Future<List<Station>> getStations() async {
    final response = await _dio.get('/api/stations');
    final data = response.data as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Tìm trạm gần nhất
  Future<List<Station>> getNearestStations({
    required double lat,
    required double lng,
    int limit = 10,
  }) async {
    final response = await _dio.get('/api/stations/nearest', 
      queryParameters: {'lat': lat, 'lng': lng, 'limit': limit}
    );
    return (response.data as List).map((json) => Station.fromJson(json)).toList();
  }

  /// Tính quãng đường từ thông tin pin
  Future<double> calculateRange(BatteryInfo info) async {
    final response = await _dio.post('/api/utils/range', data: {
      'batteryPercent': info.batteryPercent,
      'batteryCapacityKwh': info.capacityKwh,
      'consumptionKwhPerKm': info.consumptionKwhPerKm,
    });
    return (response.data['maxDistanceKm'] as num).toDouble();
  }
}
```

**Giải thích:**
- `late final`: Biến sẽ được khởi tạo sau, nhưng chỉ 1 lần
- `Dio`: Thư viện HTTP client mạnh mẽ hơn `http` package
- `10.0.2.2`: IP đặc biệt - Android emulator dùng để truy cập localhost của máy host
- `BaseOptions`: Cấu hình mặc định cho tất cả requests

**Lợi ích của typed return:**
- Trước: `Future<List<dynamic>>` - IDE không biết kiểu dữ liệu
- Sau: `Future<List<Station>>` - IDE hỗ trợ autocomplete, bắt lỗi sớm

---

### 📁 3.4. Xây dựng UI Widgets

#### 📄 File: `lib/widgets/stat_chip.dart`
**Mục đích:** Widget hiển thị thống kê nhỏ gọn, tái sử dụng

```dart
class StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const StatChip({
    super.key,
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),  // Màu nền nhạt
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,  // Chỉ chiếm không gian vừa đủ
        children: [
          Icon(icon, size: 14, color: color),
          SizedBox(width: 4),
          Text(label, style: TextStyle(
            color: color,
            fontWeight: FontWeight.w500,
            fontSize: 12,
          )),
        ],
      ),
    );
  }
}
```

**Giải thích:**
- `StatelessWidget`: Widget không có state nội bộ, render dựa trên props
- `super.key`: Truyền key lên class cha (cho widget identification)
- `MainAxisSize.min`: Row/Column chỉ chiếm không gian vừa đủ children

**Cách sử dụng:**
```dart
StatChip(icon: Icons.ev_station, label: '61 stations', color: Colors.blue)
StatChip(icon: Icons.my_location, label: 'GPS: ON', color: Colors.green)
```

---

#### 📄 File: `lib/widgets/station_bottom_sheet.dart`
**Mục đích:** Bottom sheet hiển thị chi tiết trạm sạc

```dart
class StationBottomSheet extends StatelessWidget {
  final Station station;
  final double distance;
  final VoidCallback onNavigate;

  // Static method để show từ bất kỳ đâu
  static void show(BuildContext context, {
    required Station station,
    required double distance,
    required VoidCallback onNavigate,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StationBottomSheet(
        station: station,
        distance: distance,
        onNavigate: onNavigate,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHeader(...),
          _buildDistanceChip(),
          _buildAddress(),
          _buildPortsSection(),
          _buildNavigateButton(context),
        ],
      ),
    );
  }

  // Private helper methods
  Widget _buildHeader(...) { ... }
  Widget _buildPortsSection() {
    return Wrap(
      spacing: 8,
      children: station.ports.map((port) {
        return Chip(
          avatar: Icon(Icons.bolt, color: PowerUtils.getColor(port.powerKw)),
          label: Text('${port.quantity}x ${port.powerKw}kW'),
        );
      }).toList(),
    );
  }
}
```

**Giải thích:**
- `VoidCallback`: Kiểu hàm không tham số, không return
- `static void show()`: Method tĩnh gọi trực tiếp: `StationBottomSheet.show(...)`
- `showModalBottomSheet`: Flutter API hiện modal từ dưới lên
- `_buildXxx()`: Private methods (bắt đầu `_`) để tách nhỏ UI
- `Wrap`: Layout widget tự động xuống dòng khi hết chỗ

---

#### 📄 File: `lib/widgets/range_panel.dart`
**Mục đích:** Panel nhập thông tin tính quãng đường

```dart
class RangePanel extends StatefulWidget {
  final LatLng? currentPosition;
  final bool isCalculating;
  final VoidCallback? onCalculate;
  final Function(BatteryInfo) onBatteryInfoChanged;

  @override
  State<RangePanel> createState() => _RangePanelState();
}

class _RangePanelState extends State<RangePanel> {
  // Controllers quản lý text trong TextField
  late final TextEditingController _batteryPercentController;
  late final TextEditingController _capacityController;
  late final TextEditingController _consumptionController;

  @override
  void initState() {
    super.initState();
    // Khởi tạo với giá trị mặc định
    final defaults = BatteryInfo.defaults();
    _batteryPercentController = TextEditingController(
      text: defaults.batteryPercent.toStringAsFixed(0),
    );
    _capacityController = TextEditingController(
      text: defaults.capacityKwh.toStringAsFixed(0),
    );
    _consumptionController = TextEditingController(
      text: defaults.consumptionKwhPerKm.toString(),
    );
  }

  @override
  void dispose() {
    // QUAN TRỌNG: Dọn dẹp để tránh memory leak
    _batteryPercentController.dispose();
    _capacityController.dispose();
    _consumptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Row(children: [
            Expanded(child: TextField(
              controller: _batteryPercentController,
              decoration: InputDecoration(labelText: 'Battery %'),
              keyboardType: TextInputType.number,
            )),
            Expanded(child: TextField(
              controller: _capacityController,
              decoration: InputDecoration(labelText: 'Capacity (kWh)'),
            )),
          ]),
          ElevatedButton(
            onPressed: widget.isCalculating ? null : _onCalculatePressed,
            child: widget.isCalculating 
              ? CircularProgressIndicator() 
              : Text('Calculate'),
          ),
        ],
      ),
    );
  }
}
```

**Giải thích:**
- `StatefulWidget`: Widget có state nội bộ, có thể thay đổi theo thời gian
- `State<RangePanel>`: Class quản lý state cho RangePanel
- `TextEditingController`: Controller quản lý nội dung TextField
- `initState()`: Lifecycle - chạy 1 lần khi widget được tạo
- `dispose()`: Lifecycle - dọn dẹp khi widget bị hủy
- `widget.xxx`: Truy cập props của StatefulWidget từ State class

**⚠️ Quan trọng:** Luôn `dispose()` controllers để tránh memory leak!

---

### 📁 3.5. Xây dựng màn hình chính

#### 📄 File: `lib/screens/map_screen.dart`
**Mục đích:** Màn hình bản đồ chính của app

```dart
class _MapScreenState extends State<MapScreen> {
  // ===== DEPENDENCY INJECTION =====
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();

  // ===== STATE VARIABLES =====
  GoogleMapController? _mapController;
  LatLng _currentPosition = LocationService.defaultLocation;
  List<Station> _stations = [];  // Typed list!
  Set<Marker> _markers = {};
  Set<Circle> _circles = {};
  bool _loadingStations = false;
  bool _loadingLocation = false;
  double? _currentRange;

  // ===== LIFECYCLE =====
  @override
  void initState() {
    super.initState();
    _initializeLocation();  // Lấy vị trí user
    _loadStations();        // Load danh sách trạm
  }

  // ===== BUILD =====
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildStatsBar(),           // Thanh thống kê
          Expanded(child: _buildMap()), // Bản đồ Google Maps
          RangePanel(...),             // Panel tính range
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _refreshLocation,
        child: Icon(Icons.my_location),
      ),
    );
  }

  Widget _buildMap() {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: _currentPosition,
        zoom: 11,
      ),
      onMapCreated: (controller) => _mapController = controller,
      markers: _markers,    // Các marker trạm sạc
      circles: _circles,    // Vòng tròn phạm vi
      myLocationEnabled: true,
    );
  }
}
```

---

### 📁 3.6. Import dữ liệu trạm sạc

#### Script: `scripts/clear_and_import.js`

```javascript
// Cấu hình các loại cổng sạc
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

// Chuyển đổi CSV → MongoDB format
function convertToMongoFormat(csvData) {
  return csvData.map(row => ({
    name: row.name,
    address: row.address,
    location: {
      type: 'Point',
      coordinates: [lng, lat]  // GeoJSON: [longitude, latitude]
    },
    ports: parsePorts(row),
    totalPorts: calculateTotalPorts(row),
    maxPowerKw: findMaxPower(row),
    operatingHours: row.operatingHours || '24/7',
    parking: row.parking || 'Unknown',
    status: row.status || 'active',
  }));
}

// Thực thi
async function clearAndImport() {
  await collection.deleteMany({});           // Xóa dữ liệu cũ
  await collection.insertMany(stations);     // Import mới
  await collection.createIndex({ location: '2dsphere' });  // Tạo geo index
}
```

**Kết quả:** Import thành công **61 trạm sạc** từ file CSV

---

## 4️⃣ CẤU TRÚC THƯ MỤC DỰ ÁN

```
ev_app/
├── lib/                              # 📱 Flutter App Source
│   ├── main.dart                     # Entry point
│   ├── models/                       # 📦 Data Models
│   │   ├── models.dart               # Barrel export
│   │   ├── station.dart              # Model trạm sạc
│   │   ├── port.dart                 # Model cổng sạc
│   │   └── battery_info.dart         # Model thông tin pin
│   ├── services/                     # 🔧 Business Logic
│   │   ├── services.dart             # Barrel export
│   │   ├── api_service.dart          # Gọi API backend
│   │   └── location_service.dart     # Xử lý GPS
│   ├── screens/                      # 📱 Màn hình
│   │   └── map_screen.dart           # Màn hình bản đồ chính
│   ├── widgets/                      # 🧩 UI Components
│   │   ├── widgets.dart              # Barrel export
│   │   ├── stat_chip.dart            # Chip thống kê
│   │   ├── legend_dialog.dart        # Dialog chú thích
│   │   ├── station_bottom_sheet.dart # Bottom sheet chi tiết
│   │   └── range_panel.dart          # Panel tính range
│   └── utils/                        # 🛠️ Tiện ích
│       ├── utils.dart                # Barrel export
│       └── power_utils.dart          # Utilities công suất
├── server/                           # 🖥️ Backend
│   └── index.js                      # Express.js API server
├── scripts/                          # 📜 Scripts
│   ├── clear_and_import.js           # Import CSV → MongoDB
│   └── csv_to_json.js                # Convert CSV → JSON
├── data/                             # 📊 Data
│   └── stations_template.csv         # Dữ liệu 61 trạm
├── pubspec.yaml                      # Flutter dependencies
└── package.json                      # Node.js dependencies
```

---

## 5️⃣ NGUYÊN TẮC THIẾT KẾ ĐÃ ÁP DỤNG

### 5.1. SOLID Principles

| Nguyên tắc | Ý nghĩa | Áp dụng trong dự án |
|------------|---------|---------------------|
| **S** - Single Responsibility | Mỗi class chỉ làm 1 việc | `LocationService` chỉ xử lý GPS |
| **O** - Open/Closed | Mở để mở rộng, đóng để sửa đổi | Thêm model mới không sửa code cũ |
| **L** - Liskov Substitution | Subclass thay thế được parent | Các widget đều extend đúng base |
| **I** - Interface Segregation | Interface nhỏ gọn, tập trung | Mỗi widget nhận props riêng biệt |
| **D** - Dependency Inversion | Phụ thuộc abstraction | MapScreen dùng Service interface |

### 5.2. Các Design Patterns đã dùng

| Pattern | Mô tả | Ví dụ |
|---------|-------|-------|
| **MVC** | Model-View-Controller | Models / Widgets / Services |
| **Result Pattern** | Return kết quả thay vì throw | `LocationResult.success/failure` |
| **Factory Pattern** | Tạo object qua factory | `Station.fromJson()` |
| **Singleton** | 1 instance duy nhất | `ApiService` (có thể mở rộng) |
| **Composition** | Kết hợp widgets | `MapScreen` dùng nhiều widgets |
| **Barrel Export** | Gom exports | `models/models.dart` |

### 5.3. Clean Architecture

```
┌─────────────────────────────────────────────────────┐
│                    PRESENTATION                      │
│  screens/map_screen.dart                            │
│  widgets/*.dart                                      │
├─────────────────────────────────────────────────────┤
│                   DOMAIN/BUSINESS                    │
│  services/api_service.dart                          │
│  services/location_service.dart                     │
├─────────────────────────────────────────────────────┤
│                       DATA                           │
│  models/station.dart                                │
│  models/port.dart                                   │
│  models/battery_info.dart                           │
└─────────────────────────────────────────────────────┘
```

---

## 6️⃣ THỐNG KÊ CODE

| Metric | Giá trị |
|--------|---------|
| **Tổng số files Flutter** | 15 files |
| **Tổng dòng code Dart** | ~1,500 dòng |
| **Backend files** | 1 file (index.js) |
| **Backend dòng code** | ~250 dòng |
| **API Endpoints** | 5 endpoints |
| **Models** | 3 (Station, Port, BatteryInfo) |
| **Widgets** | 4 reusable widgets |
| **Services** | 2 (API, Location) |

---

## 7️⃣ HƯỚNG DẪN CHẠY DỰ ÁN

### Yêu cầu
- Node.js 18+
- Flutter 3.x
- Android Studio (cho emulator) hoặc thiết bị thật

### Các bước

```powershell
# 1. Clone/mở dự án
cd C:\Users\luquo\2025.1\GR2\ev_app

# 2. Cài đặt Node.js dependencies
npm install

# 3. Import dữ liệu vào MongoDB
node scripts/clear_and_import.js

# 4. Chạy Backend Server (terminal 1)
node server/index.js

# 5. Cài đặt Flutter packages (terminal 2)
flutter pub get

# 6. Chạy Flutter App
flutter run -d windows    # Windows desktop
flutter run -d chrome     # Web browser
flutter run -d android    # Android emulator/device
```

---

## 8️⃣ KẾ HOẠCH TUẦN TỚI

| STT | Công việc | Ưu tiên |
|-----|-----------|---------|
| 1 | Thêm tính năng tìm kiếm trạm | Cao |
| 2 | Thêm filter theo công suất | Trung bình |
| 3 | Tích hợp navigation Google Maps | Cao |
| 4 | Cải thiện UI/UX | Thấp |
| 5 | Viết unit tests | Trung bình |

---

## 9️⃣ VẤN ĐỀ GẶP PHẢI VÀ CÁCH GIẢI QUYẾT

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| SSL error MongoDB | Network timeout | Retry connection |
| Android không kết nối backend | localhost sai | Dùng IP `10.0.2.2` |
| Google Maps không hiện | Thiếu API Key | Thêm key vào AndroidManifest |
| GPS permission denied | Chưa khai báo | Thêm vào AndroidManifest.xml |

---

## 🔟 KẾT LUẬN

Tuần này đã hoàn thành việc **xây dựng từ đầu** ứng dụng EV Charging Station với:

✅ **Backend API** hoàn chỉnh với 5 endpoints  
✅ **Flutter App** với kiến trúc clean, 15 files  
✅ **Database** MongoDB Atlas với GeoSpatial queries  
✅ **61 trạm sạc** tại Hà Nội và vùng lân cận  
✅ Áp dụng **SOLID principles** và **Clean Architecture**  
✅ Code có **type safety** với typed models  
✅ **Reusable widgets** dễ mở rộng  

---

**Người báo cáo:** [Tên]  
**Ngày:** 11/12/2025
