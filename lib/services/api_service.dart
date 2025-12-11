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

  /// Get all stations
  Future<List<Station>> getStations() async {
    final response = await _dio.get('/api/stations');
    final data = response.data as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Get nearest stations
  Future<List<Station>> getNearestStations({
    required double lat,
    required double lng,
    int limit = 10,
  }) async {
    final response = await _dio.get('/api/stations/nearest', queryParameters: {
      'lat': lat,
      'lng': lng,
      'limit': limit,
    });
    final data = response.data as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Get stations within range (radius in km)
  Future<List<Station>> getStationsInRange({
    required double lat,
    required double lng,
    required double radius,
  }) async {
    final response = await _dio.get('/api/stations/in-range', queryParameters: {
      'lat': lat,
      'lng': lng,
      'radius': radius,
    });
    final data = response.data as List<dynamic>;
    return data.map((json) => Station.fromJson(json)).toList();
  }

  /// Calculate driving range using battery info
  Future<double> calculateRange(BatteryInfo batteryInfo) async {
    final response = await _dio.post('/api/utils/range', data: {
      'batteryPercent': batteryInfo.batteryPercent,
      'batteryCapacityKwh': batteryInfo.capacityKwh,
      'consumptionKwhPerKm': batteryInfo.consumptionKwhPerKm,
    });

    return (response.data['maxDistanceKm'] as num).toDouble();
  }
}
