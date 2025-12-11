import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../models/models.dart';
import '../services/services.dart';
import '../utils/utils.dart';
import '../widgets/widgets.dart';

/// Main map screen displaying EV charging stations
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  // Services
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();

  // Map controller
  GoogleMapController? _mapController;

  // Location state
  LatLng _currentPosition = LocationService.defaultLocation;
  bool _locationLoaded = false;
  bool _loadingLocation = false;

  // Stations state
  List<Station> _stations = [];
  bool _loadingStations = false;

  // Map elements
  Set<Marker> _markers = {};
  Set<Circle> _circles = {};

  // Range calculation state
  bool _calculatingRange = false;
  double? _currentRange;
  BatteryInfo _batteryInfo = BatteryInfo.defaults();

  @override
  void initState() {
    super.initState();
    _initializeLocation();
    _loadStations();
  }

  // ==================== Location Methods ====================

  Future<void> _initializeLocation() async {
    setState(() => _loadingLocation = true);

    try {
      final result = await _locationService.getCurrentPosition();

      if (result.success && result.position != null) {
        setState(() {
          _currentPosition = result.position!;
          _locationLoaded = true;
        });

        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(_currentPosition, 13),
        );

        debugPrint('Location: ${_currentPosition.latitude}, ${_currentPosition.longitude}');
      } else {
        _showError(result.error ?? 'Could not get location');
      }
    } catch (e) {
      debugPrint('Error getting location: $e');
      _showError('Could not get location. Using default (Hanoi).');
    } finally {
      setState(() => _loadingLocation = false);
    }
  }

  Future<void> _refreshLocation() async {
    setState(() => _loadingLocation = true);

    try {
      final result = await _locationService.getCurrentPosition();

      if (result.success && result.position != null) {
        setState(() {
          _currentPosition = result.position!;
          _locationLoaded = true;
        });

        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(_currentPosition, 13),
        );

        _buildMarkers();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Location updated: ${result.position!.latitude.toStringAsFixed(5)}, '
                '${result.position!.longitude.toStringAsFixed(5)}',
              ),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
        }
      } else {
        _showError(result.error ?? 'Could not refresh location');
      }
    } catch (e) {
      _showError('Could not refresh location');
    } finally {
      setState(() => _loadingLocation = false);
    }
  }

  // ==================== Station Methods ====================

  Future<void> _loadStations() async {
    setState(() => _loadingStations = true);
    try {
      final stations = await _apiService.getStations();
      setState(() => _stations = stations);
      _buildMarkers();
    } catch (e) {
      debugPrint('Error loading stations: $e');
      _showError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setState(() => _loadingStations = false);
    }
  }

  void _buildMarkers() {
    final stationMarkers = _stations.map<Marker>((station) {
      return Marker(
        markerId: MarkerId(station.id),
        position: LatLng(station.lat, station.lng),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          PowerUtils.getMarkerHue(station.maxPowerKw),
        ),
        onTap: () => _showStationDetails(station),
      );
    }).toSet();

    // Add user location marker
    if (_locationLoaded) {
      stationMarkers.add(
        Marker(
          markerId: const MarkerId('user_location'),
          position: _currentPosition,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
          infoWindow: const InfoWindow(title: 'Your Location'),
        ),
      );
    }

    setState(() => _markers = stationMarkers);
  }

  void _showStationDetails(Station station) {
    final distance = _locationService.distanceBetween(
      _currentPosition,
      LatLng(station.lat, station.lng),
    );

    StationBottomSheet.show(
      context,
      station: station,
      distance: distance,
      onNavigate: () => _navigateToStation(station),
    );
  }

  void _navigateToStation(Station station) {
    _mapController?.animateCamera(
      CameraUpdate.newLatLngZoom(LatLng(station.lat, station.lng), 16),
    );
  }

  Future<void> _findNearestStation() async {
    try {
      final nearest = await _apiService.getNearestStations(
        lat: _currentPosition.latitude,
        lng: _currentPosition.longitude,
        limit: 1,
      );

      if (nearest.isNotEmpty) {
        final station = nearest[0];
        final distance = station.distance ?? 0;

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Nearest: ${station.name} ($distance km)'),
              action: SnackBarAction(
                label: 'View',
                onPressed: () => _showStationDetails(station),
              ),
              duration: const Duration(seconds: 4),
            ),
          );
        }

        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(station.lat, station.lng), 14),
        );
      }
    } catch (e) {
      _showError('Could not find nearest station');
    }
  }

  // ==================== Range Calculation ====================

  Future<void> _onCalculateRange() async {
    if (!_batteryInfo.isValid) return;

    setState(() => _calculatingRange = true);
    try {
      final maxDistanceKm = await _apiService.calculateRange(_batteryInfo);

      setState(() {
        _currentRange = maxDistanceKm;
        _circles = {
          Circle(
            circleId: const CircleId('range'),
            center: _currentPosition,
            radius: maxDistanceKm * 1000,
            strokeWidth: 2,
            strokeColor: Colors.green,
            fillColor: Colors.green.withOpacity(0.15),
          ),
        };
      });

      // Load stations in range
      final stationsInRange = await _apiService.getStationsInRange(
        lat: _currentPosition.latitude,
        lng: _currentPosition.longitude,
        radius: maxDistanceKm,
      );

      _showRangeResult(maxDistanceKm, stationsInRange.length);
    } catch (e) {
      debugPrint('Error calculating range: $e');
      _showError('Error calculating range');
    } finally {
      setState(() => _calculatingRange = false);
    }
  }

  // ==================== UI Helpers ====================

  void _showRangeResult(double range, int stationsCount) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Range: ${range.toStringAsFixed(1)} km | $stationsCount stations reachable',
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  // ==================== Build Methods ====================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildStatsBar(),
          Expanded(child: _buildMap()),
          RangePanel(
            currentPosition: _locationLoaded ? _currentPosition : null,
            isCalculating: _calculatingRange,
            onCalculate: _onCalculateRange,
            onBatteryInfoChanged: (info) => _batteryInfo = info,
          ),
        ],
      ),
      floatingActionButton: _buildLocationFab(),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text('EV Charging Map'),
      actions: [
        if (_loadingStations || _loadingLocation)
          const Padding(
            padding: EdgeInsets.all(16),
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            ),
          )
        else
          IconButton(
            onPressed: _loadStations,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh stations',
          ),
        IconButton(
          onPressed: _findNearestStation,
          icon: const Icon(Icons.near_me),
          tooltip: 'Find nearest station',
        ),
        IconButton(
          onPressed: () => LegendDialog.show(context),
          icon: const Icon(Icons.info_outline),
          tooltip: 'Legend',
        ),
      ],
    );
  }

  Widget _buildStatsBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: Colors.grey[100],
      child: Row(
        children: [
          StatChip(
            icon: Icons.ev_station,
            label: '${_stations.length} stations',
            color: Colors.blue,
          ),
          const SizedBox(width: 8),
          StatChip(
            icon: _locationLoaded ? Icons.my_location : Icons.location_off,
            label: _locationLoaded ? 'GPS: ON' : 'GPS: OFF',
            color: _locationLoaded ? Colors.green : Colors.red,
          ),
          const Spacer(),
          if (_currentRange != null)
            StatChip(
              icon: Icons.radio_button_checked,
              label: '${_currentRange!.toStringAsFixed(1)} km',
              color: Colors.green,
            ),
        ],
      ),
    );
  }

  Widget _buildMap() {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: _currentPosition,
        zoom: 11,
      ),
      onMapCreated: (controller) {
        _mapController = controller;
        if (_locationLoaded) {
          controller.animateCamera(
            CameraUpdate.newLatLngZoom(_currentPosition, 13),
          );
        }
      },
      markers: _markers,
      circles: _circles,
      myLocationButtonEnabled: false,
      myLocationEnabled: true,
      zoomControlsEnabled: true,
      mapToolbarEnabled: false,
    );
  }

  Widget _buildLocationFab() {
    return FloatingActionButton(
      onPressed: _loadingLocation ? null : _refreshLocation,
      tooltip: 'My Location',
      child: _loadingLocation
          ? const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : const Icon(Icons.my_location),
    );
  }
}
