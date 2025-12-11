import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/station.dart';

/// Utility class for power-related operations
class PowerUtils {
  PowerUtils._(); // Private constructor - utility class

  /// Get color based on power level
  static Color getColor(int powerKw) {
    if (powerKw >= 150) return Colors.green;
    if (powerKw >= 60) return Colors.blue;
    return Colors.orange;
  }

  /// Get color for power category
  static Color getCategoryColor(PowerCategory category) {
    switch (category) {
      case PowerCategory.superfast:
        return Colors.green;
      case PowerCategory.fast:
        return Colors.blue;
      case PowerCategory.normal:
        return Colors.orange;
    }
  }

  /// Get marker hue based on power level
  static double getMarkerHue(int powerKw) {
    if (powerKw >= 150) return BitmapDescriptor.hueGreen;
    if (powerKw >= 60) return BitmapDescriptor.hueAzure;
    return BitmapDescriptor.hueOrange;
  }

  /// Get label for power category
  static String getCategoryLabel(PowerCategory category) {
    switch (category) {
      case PowerCategory.superfast:
        return 'Superfast (150+ kW)';
      case PowerCategory.fast:
        return 'Fast (60-149 kW)';
      case PowerCategory.normal:
        return 'Normal (< 60 kW)';
    }
  }
}

