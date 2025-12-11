/// Represents battery information for range calculation
class BatteryInfo {
  final double batteryPercent;
  final double capacityKwh;
  final double consumptionKwhPerKm;

  const BatteryInfo({
    required this.batteryPercent,
    required this.capacityKwh,
    required this.consumptionKwhPerKm,
  });

  /// Default values for a typical EV
  factory BatteryInfo.defaults() {
    return const BatteryInfo(
      batteryPercent: 50.0,
      capacityKwh: 50.0,
      consumptionKwhPerKm: 0.15,
    );
  }

  /// Check if values are valid for calculation
  bool get isValid =>
      batteryPercent > 0 && capacityKwh > 0 && consumptionKwhPerKm > 0;

  /// Calculate estimated range in km
  double get estimatedRangeKm {
    if (!isValid) return 0;
    final availableEnergy = (batteryPercent / 100) * capacityKwh;
    return availableEnergy / consumptionKwhPerKm;
  }

  BatteryInfo copyWith({
    double? batteryPercent,
    double? capacityKwh,
    double? consumptionKwhPerKm,
  }) {
    return BatteryInfo(
      batteryPercent: batteryPercent ?? this.batteryPercent,
      capacityKwh: capacityKwh ?? this.capacityKwh,
      consumptionKwhPerKm: consumptionKwhPerKm ?? this.consumptionKwhPerKm,
    );
  }
}

