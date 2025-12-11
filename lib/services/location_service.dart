import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Result of location operations
class LocationResult {
  final LatLng? position;
  final String? error;
  final bool success;

  const LocationResult._({
    this.position,
    this.error,
    required this.success,
  });

  factory LocationResult.success(LatLng position) {
    return LocationResult._(position: position, success: true);
  }

  factory LocationResult.failure(String error) {
    return LocationResult._(error: error, success: false);
  }
}

/// Service for handling location operations
class LocationService {
  /// Default location (Hanoi) when GPS is not available
  static const LatLng defaultLocation = LatLng(21.0278, 105.8342);

  /// Check if location services are enabled and permissions granted
  Future<LocationResult> checkPermissions() async {
    // Check if location services are enabled
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return LocationResult.failure(
        'Location services are disabled. Please enable GPS.',
      );
    }

    // Check permissions
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return LocationResult.failure('Location permission denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return LocationResult.failure(
        'Location permissions are permanently denied. Please enable in settings.',
      );
    }

    return LocationResult.success(defaultLocation);
  }

  /// Get current position with proper error handling
  Future<LocationResult> getCurrentPosition() async {
    // First check permissions
    final permResult = await checkPermissions();
    if (!permResult.success) {
      return permResult;
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      return LocationResult.success(
        LatLng(position.latitude, position.longitude),
      );
    } catch (e) {
      return LocationResult.failure('Could not get location: $e');
    }
  }

  /// Calculate distance between two points in kilometers
  double distanceBetween(LatLng from, LatLng to) {
    return Geolocator.distanceBetween(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    ) / 1000; // Convert to km
  }
}

