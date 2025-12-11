import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/battery_info.dart';

/// Panel for calculating driving range
class RangePanel extends StatefulWidget {
  final LatLng? currentPosition;
  final bool isCalculating;
  final VoidCallback? onCalculate;
  final Function(BatteryInfo) onBatteryInfoChanged;

  const RangePanel({
    super.key,
    required this.currentPosition,
    required this.isCalculating,
    required this.onCalculate,
    required this.onBatteryInfoChanged,
  });

  @override
  State<RangePanel> createState() => _RangePanelState();
}

class _RangePanelState extends State<RangePanel> {
  late final TextEditingController _batteryPercentController;
  late final TextEditingController _capacityController;
  late final TextEditingController _consumptionController;

  @override
  void initState() {
    super.initState();
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
    _batteryPercentController.dispose();
    _capacityController.dispose();
    _consumptionController.dispose();
    super.dispose();
  }

  void _onCalculatePressed() {
    final batteryInfo = BatteryInfo(
      batteryPercent: double.tryParse(_batteryPercentController.text.trim()) ?? 0,
      capacityKwh: double.tryParse(_capacityController.text.trim()) ?? 0,
      consumptionKwhPerKm: double.tryParse(_consumptionController.text.trim()) ?? 0.15,
    );
    
    if (!batteryInfo.isValid) return;
    
    widget.onBatteryInfoChanged(batteryInfo);
    widget.onCalculate?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            blurRadius: 4,
            color: Colors.black.withOpacity(0.1),
            offset: const Offset(0, -2),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 8),
          _buildInputRow1(),
          const SizedBox(height: 8),
          _buildInputRow2(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        const Text(
          'Calculate Driving Range',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const Spacer(),
        if (widget.currentPosition != null)
          Text(
            'From: ${widget.currentPosition!.latitude.toStringAsFixed(4)}, '
            '${widget.currentPosition!.longitude.toStringAsFixed(4)}',
            style: TextStyle(fontSize: 10, color: Colors.grey[600]),
          ),
      ],
    );
  }

  Widget _buildInputRow1() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _batteryPercentController,
            decoration: const InputDecoration(
              labelText: 'Battery %',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: TextField(
            controller: _capacityController,
            decoration: const InputDecoration(
              labelText: 'Capacity (kWh)',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
        ),
      ],
    );
  }

  Widget _buildInputRow2() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _consumptionController,
            decoration: const InputDecoration(
              labelText: 'Consumption (kWh/km)',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
        ),
        const SizedBox(width: 8),
        ElevatedButton(
          onPressed: widget.isCalculating ? null : _onCalculatePressed,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: 20,
              vertical: 14,
            ),
          ),
          child: widget.isCalculating
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Calculate'),
        ),
      ],
    );
  }
}

