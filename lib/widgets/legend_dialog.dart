import 'package:flutter/material.dart';
import '../models/station.dart';
import '../utils/power_utils.dart';

/// Dialog showing marker legend
class LegendDialog extends StatelessWidget {
  const LegendDialog({super.key});

  static void show(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const LegendDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Marker Legend'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildLegendItem(
            PowerUtils.getCategoryColor(PowerCategory.superfast),
            PowerUtils.getCategoryLabel(PowerCategory.superfast),
          ),
          _buildLegendItem(
            PowerUtils.getCategoryColor(PowerCategory.fast),
            PowerUtils.getCategoryLabel(PowerCategory.fast),
          ),
          _buildLegendItem(
            PowerUtils.getCategoryColor(PowerCategory.normal),
            PowerUtils.getCategoryLabel(PowerCategory.normal),
          ),
          _buildLegendItem(Colors.purple, 'Your Location'),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('OK'),
        ),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(Icons.location_on, color: color),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

