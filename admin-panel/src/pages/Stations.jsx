import { useState, useEffect } from 'react';
import api from '../services/api';
import './Stations.css';

// Port types theo CSV format
const PORT_TYPES = [
  { key: 'ports_250kw', label: '250kW', powerKw: 250 },
  { key: 'ports_180kw', label: '180kW', powerKw: 180 },
  { key: 'ports_150kw', label: '150kW', powerKw: 150 },
  { key: 'ports_120kw', label: '120kW', powerKw: 120 },
  { key: 'ports_80kw', label: '80kW', powerKw: 80 },
  { key: 'ports_60kw', label: '60kW', powerKw: 60 },
  { key: 'ports_40kw', label: '40kW', powerKw: 40 },
  { key: 'ports_ac', label: 'AC (7kW)', powerKw: 7 },
];

function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    operatingHours: '24/7',
    parking: 'Unknown',
    stationType: 'public',
    status: 'active',
    ports: {}, // { ports_250kw: 0, ports_180kw: 0, ... }
  });
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadStations();
    // Initialize ports object
    const initialPorts = {};
    PORT_TYPES.forEach((pt) => {
      initialPorts[pt.key] = 0;
    });
    setFormData((prev) => ({ ...prev, ports: initialPorts }));
  }, []);

  const loadStations = async () => {
    try {
      const response = await api.getStations();
      setStations(response.data || []);
    } catch (err) {
      console.error('Error loading stations:', err);
      alert('Error loading stations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (station = null) => {
    if (station) {
      setEditingStation(station);
      // Parse ports from station data
      const portsObj = {};
      PORT_TYPES.forEach((pt) => {
        portsObj[pt.key] = 0;
      });
      
      // If station has ports array, convert to form format
      if (station.ports && Array.isArray(station.ports)) {
        station.ports.forEach((port) => {
          const portType = PORT_TYPES.find((pt) => pt.powerKw === port.powerKw);
          if (portType) {
            portsObj[portType.key] = port.quantity || 0;
          }
        });
      }
      
      // If station has chargers (v1 format)
      if (station.chargers && Array.isArray(station.chargers)) {
        station.chargers.forEach((charger) => {
          const portType = PORT_TYPES.find((pt) => pt.powerKw === charger.powerKw);
          if (portType) {
            portsObj[portType.key] = (portsObj[portType.key] || 0) + (charger.quantity || 0);
          }
        });
      }

      setFormData({
        name: station.name || '',
        address: station.address || '',
        lat: station.lat || station.location?.coordinates?.[1] || '',
        lng: station.lng || station.location?.coordinates?.[0] || '',
        operatingHours: station.operatingHours || (station.open247 ? '24/7' : '08:00-22:00'),
        parking: station.parking || station.parkingFeeNote || 'Unknown',
        stationType: station.stationType || 'public',
        status: station.status || 'active',
        ports: portsObj,
      });
    } else {
      setEditingStation(null);
      const initialPorts = {};
      PORT_TYPES.forEach((pt) => {
        initialPorts[pt.key] = 0;
      });
      setFormData({
        name: '',
        address: '',
        lat: '',
        lng: '',
        operatingHours: '24/7',
        parking: 'Unknown',
        stationType: 'public',
        status: 'active',
        ports: initialPorts,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStation(null);
  };

  const handlePortChange = (portKey, value) => {
    setFormData({
      ...formData,
      ports: {
        ...formData.ports,
        [portKey]: parseInt(value) || 0,
      },
    });
  };

  const calculateTotalPorts = () => {
    return Object.values(formData.ports).reduce((sum, qty) => sum + qty, 0);
  };

  const calculateMaxPower = () => {
    let maxPower = 0;
    PORT_TYPES.forEach((pt) => {
      if (formData.ports[pt.key] > 0) {
        maxPower = Math.max(maxPower, pt.powerKw);
      }
    });
    return maxPower;
  };

  const convertPortsToArray = () => {
    const portsArray = [];
    PORT_TYPES.forEach((pt) => {
      const quantity = formData.ports[pt.key] || 0;
      if (quantity > 0) {
        portsArray.push({
          quantity: quantity,
          powerKw: pt.powerKw,
          category: pt.powerKw >= 120 ? 'superfast' : pt.powerKw >= 60 ? 'fast' : pt.powerKw >= 20 ? 'normal' : 'slow',
        });
      }
    });
    return portsArray;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const portsArray = convertPortsToArray();
      const totalPorts = calculateTotalPorts();
      const maxPowerKw = calculateMaxPower();

      if (totalPorts === 0) {
        alert('Please add at least one charging port');
        return;
      }

      const stationData = {
        name: formData.name,
        address: formData.address,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
        },
        ports: portsArray,
        totalPorts: totalPorts,
        maxPowerKw: maxPowerKw,
        operatingHours: formData.operatingHours,
        parking: formData.parking,
        stationType: formData.stationType,
        status: formData.status,
      };

      if (editingStation) {
        await api.updateStation(editingStation._id || editingStation.id, stationData);
      } else {
        await api.createStation(stationData);
      }

      handleCloseModal();
      loadStations();
    } catch (err) {
      alert('Error saving station: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this station?')) return;

    try {
      await api.deleteStation(id);
      loadStations();
    } catch (err) {
      alert('Error deleting station: ' + err.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleImportCSV = async () => {
    if (!importFile) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      await api.importStationsCSV(formData);
      alert('Stations imported successfully!');
      setShowImportModal(false);
      setImportFile(null);
      loadStations();
    } catch (err) {
      alert('Error importing CSV: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading stations...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Charging Stations</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Add Station
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Location</th>
                <th>Max Power (kW)</th>
                <th>Ports</th>
                <th>Operating Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    No stations found
                  </td>
                </tr>
              ) : (
                stations.map((station) => (
                  <tr key={station._id || station.id}>
                    <td>{station.name}</td>
                    <td>{station.address}</td>
                    <td>
                      {station.lat && station.lng
                        ? `${parseFloat(station.lat).toFixed(4)}, ${parseFloat(station.lng).toFixed(4)}`
                        : station.location?.coordinates
                        ? `${parseFloat(station.location.coordinates[1]).toFixed(4)}, ${parseFloat(station.location.coordinates[0]).toFixed(4)}`
                        : 'N/A'}
                    </td>
                    <td>
                      {station.maxPowerKw 
                        ? `${station.maxPowerKw}kW` 
                        : station.chargers && station.chargers.length > 0
                        ? `${Math.max(...station.chargers.map(c => c.powerKw))}kW`
                        : 'N/A'}
                    </td>
                    <td>
                      {(() => {
                        const totalPorts = station.totalPorts || 
                          (station.ports && station.ports.length > 0 
                            ? station.ports.reduce((sum, p) => sum + (p.quantity || 0), 0)
                            : 0) ||
                          (station.chargers && station.chargers.length > 0
                            ? station.chargers.reduce((sum, c) => sum + (c.quantity || 0), 0)
                            : 0);
                        const ports = station.ports || 
                          (station.chargers ? station.chargers.map(c => ({ quantity: c.quantity, powerKw: c.powerKw })) : []);
                        return (
                          <>
                            {totalPorts}
                            {ports && ports.length > 0 && (
                              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '5px' }}>
                                ({ports.map((p) => `${p.quantity}x${p.powerKw}kW`).join(', ')})
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </td>
                    <td>
                      {station.operatingHours || 
                       (station.open247 ? '24/7' : 'N/A')}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: station.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: station.status === 'active' ? '#065f46' : '#991b1b',
                        }}
                      >
                        {station.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenModal(station)}
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(station._id || station.id)}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Station Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStation ? 'Edit Station' : 'Add Station'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Charging Ports */}
              <div className="form-group">
                <label>Charging Ports *</label>
                <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '15px', background: '#f9fafb' }}>
                  {PORT_TYPES.map((pt) => (
                    <div key={pt.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ width: '120px', marginRight: '10px', fontSize: '14px' }}>
                        {pt.label}:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.ports[pt.key] || 0}
                        onChange={(e) => handlePortChange(pt.key, e.target.value)}
                        style={{ width: '80px', padding: '8px' }}
                      />
                      <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748b' }}>
                        ports
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #d1d5db' }}>
                    <strong>Total Ports: {calculateTotalPorts()}</strong>
                    {calculateMaxPower() > 0 && (
                      <span style={{ marginLeft: '15px', color: '#64748b' }}>
                        Max Power: {calculateMaxPower()}kW
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Operating Hours *</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    placeholder="24/7 or 08:00-22:00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parking *</label>
                  <input
                    type="text"
                    value={formData.parking}
                    onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                    placeholder="Paid, Free, Unknown"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Station Type</label>
                  <select
                    value={formData.stationType}
                    onChange={(e) => setFormData({ ...formData, stationType: e.target.value })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import Stations from CSV</h3>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                ×
              </button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
                CSV format should include: name, address, latitude, longitude, ports_250kw, ports_180kw, ports_150kw, ports_120kw, ports_80kw, ports_60kw, ports_40kw, ports_ac, operatingHours, parking, stationType, status
              </p>
              <div className="form-group">
                <label>Select CSV File *</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ padding: '8px' }}
                />
                {importFile && (
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#059669' }}>
                    Selected: {importFile.name}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImportCSV}
                disabled={!importFile || importing}
              >
                {importing ? 'Importing...' : 'Import CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stations;
