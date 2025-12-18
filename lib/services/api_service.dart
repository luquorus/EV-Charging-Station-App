import 'package:dio/dio.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/models.dart';

/// Service for API communication with the backend
class ApiService {
  late final Dio _dio;

  ApiService() {
    // Use different URL based on platform
    String baseUrl;
    if (kIsWeb) {
      baseUrl = 'http://localhost:3000';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:3000'; // Android emulator
    } else {
      baseUrl = 'http://localhost:3000'; // iOS, Windows, macOS, Linux
    }
    
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));
  }

  /// Get all stations (using v1 API with pagination support)
  /// Optional filters: search, minPowerKw, open247, page, limit
  Future<List<Station>> getStations({
    String? search,
    int? minPowerKw,
    bool? open247,
    int page = 1,
    int limit = 1000, // Large limit to get all stations by default
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (minPowerKw != null) queryParams['minPowerKw'] = minPowerKw;
    if (open247 != null) queryParams['open247'] = open247;

    final response = await _dio.get('/api/v1/stations', queryParameters: queryParams);
    
    // v1 API trả về { data: [...], meta: {...} }
    final responseData = response.data as Map<String, dynamic>;
    final data = responseData['data'] as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Get nearest stations (using v1 API)
  Future<List<Station>> getNearestStations({
    required double lat,
    required double lng,
    int limit = 10,
  }) async {
    final response = await _dio.get('/api/v1/stations/nearest', queryParameters: {
      'lat': lat,
      'lng': lng,
      'limit': limit,
    });
    final data = response.data as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Get stations within range (using v1 API, radius in km)
  Future<List<Station>> getStationsInRange({
    required double lat,
    required double lng,
    required double radius,
  }) async {
    final response = await _dio.get('/api/v1/stations/in-range', queryParameters: {
      'lat': lat,
      'lng': lng,
      'radiusKm': radius,
    });
    final data = response.data as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Calculate driving range using battery info
  Future<double> calculateRange(BatteryInfo batteryInfo) async {
    final response = await _dio.post('/api/v1/range/calc', data: {
      'batteryPercent': batteryInfo.batteryPercent,
      'capacityKwh': batteryInfo.capacityKwh,
      'consumptionKwhPerKm': batteryInfo.consumptionKwhPerKm,
    });

    // v1 API trả về { success, data: { rangeKm, currentEnergyKwh }, meta }
    final data = response.data['data'] as Map<String, dynamic>;
    return (data['rangeKm'] as num).toDouble();
  }
}
