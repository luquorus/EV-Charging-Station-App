import 'package:flutter/material.dart';
import '../models/station.dart';
import '../utils/power_utils.dart';

/// Bottom sheet showing station details
class StationBottomSheet extends StatelessWidget {
  final Station station;
  final double distance;
  final VoidCallback onNavigate;

  const StationBottomSheet({
    super.key,
    required this.station,
    required this.distance,
    required this.onNavigate,
  });

  /// Show the station bottom sheet
  static void show(
    BuildContext context, {
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
    final powerColor = PowerUtils.getColor(station.maxPowerKw);

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(powerColor, context),
          const SizedBox(height: 12),
          _buildDistanceChip(),
          const SizedBox(height: 12),
          _buildAddress(),
          const SizedBox(height: 8),
          _buildOperatingHours(),
          const SizedBox(height: 8),
          _buildParking(),
          const SizedBox(height: 16),
          _buildPortsSection(),
          const SizedBox(height: 16),
          _buildNavigateButton(context),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildHeader(Color powerColor, BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: powerColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.ev_station,
            color: powerColor,
            size: 28,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                station.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${station.totalPorts} ports | Max ${station.maxPowerKw}kW',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.close),
        ),
      ],
    );
  }

  Widget _buildDistanceChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.directions_car, size: 16, color: Colors.blue),
          const SizedBox(width: 4),
          Text(
            '${distance.toStringAsFixed(1)} km away',
            style: const TextStyle(
              color: Colors.blue,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddress() {
    return Row(
      children: [
        Icon(Icons.location_on, color: Colors.grey[600], size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            station.address,
            style: TextStyle(color: Colors.grey[700]),
          ),
        ),
      ],
    );
  }

  Widget _buildOperatingHours() {
    return Row(
      children: [
        Icon(Icons.access_time, color: Colors.grey[600], size: 20),
        const SizedBox(width: 8),
        Text(
          station.operatingHours,
          style: TextStyle(color: Colors.grey[700]),
        ),
      ],
    );
  }

  Widget _buildParking() {
    return Row(
      children: [
        Icon(Icons.local_parking, color: Colors.grey[600], size: 20),
        const SizedBox(width: 8),
        Text(
          station.parking,
          style: TextStyle(color: Colors.grey[700]),
        ),
      ],
    );
  }

  Widget _buildPortsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Available Ports',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: station.ports.map((port) {
            final powerColor = PowerUtils.getColor(port.powerKw);
            return Chip(
              avatar: Icon(
                Icons.bolt,
                color: powerColor,
                size: 18,
              ),
              label: Text('${port.quantity}x ${port.powerKw}kW'),
              backgroundColor: powerColor.withOpacity(0.1),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildNavigateButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.pop(context);
          onNavigate();
        },
        icon: const Icon(Icons.directions),
        label: Text('Navigate (${distance.toStringAsFixed(1)} km)'),
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }
}

