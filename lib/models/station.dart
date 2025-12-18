import 'port.dart';

/// Represents an EV charging station
class Station {
  final String id;
  final String name;
  final String address;
  final double lat;
  final double lng;
  final int totalPorts;
  final int maxPowerKw;
  final List<Port> ports;
  final String operatingHours;
  final String parking;
  final double? distance; // Distance from user (optional, set when querying nearby)

  const Station({
    required this.id,
    required this.name,
    required this.address,
    required this.lat,
    required this.lng,
    required this.totalPorts,
    required this.maxPowerKw,
    required this.ports,
    this.operatingHours = '24/7',
    this.parking = 'Unknown',
    this.distance,
  });

  factory Station.fromJson(Map<String, dynamic> json) {
    final portsList = (json['ports'] as List<dynamic>?)
        ?.map((p) => Port.fromJson(p as Map<String, dynamic>))
        .toList() ?? [];

    // v1 API uses 'id' or '_id', legacy uses '_id'
    final stationId = json['id']?.toString() ?? 
                      json['_id']?.toString() ?? 
                      '${json['lat']}_${json['lng']}';

    // v1 API uses 'distanceKm', legacy uses 'distance'
    final distanceValue = json['distanceKm'] ?? json['distance'];

    return Station(
      id: stationId,
      name: json['name'] ?? 'Unknown Station',
      address: json['address'] ?? 'No address',
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      totalPorts: json['totalPorts'] ?? 0,
      maxPowerKw: json['maxPowerKw'] ?? 0,
      ports: portsList,
      operatingHours: json['operatingHours'] ?? '24/7',
      parking: json['parking'] ?? 'Unknown',
      distance: distanceValue != null 
          ? (distanceValue as num).toDouble() 
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'address': address,
    'lat': lat,
    'lng': lng,
    'totalPorts': totalPorts,
    'maxPowerKw': maxPowerKw,
    'ports': ports.map((p) => p.toJson()).toList(),
    'operatingHours': operatingHours,
    'parking': parking,
    if (distance != null) 'distance': distance,
  };

  /// Get power category for color coding
  PowerCategory get powerCategory {
    if (maxPowerKw >= 150) return PowerCategory.superfast;
    if (maxPowerKw >= 60) return PowerCategory.fast;
    return PowerCategory.normal;
  }
}

/// Power category for station classification
enum PowerCategory {
  superfast, // 150+ kW
  fast,      // 60-149 kW
  normal,    // < 60 kW
}

