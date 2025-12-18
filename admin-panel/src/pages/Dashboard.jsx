import { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStations: 0,
    totalUsers: 0,
    activeStations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load stations count
      const stationsRes = await api.getStations({ limit: 1 });
      const stationsCount = stationsRes.meta?.total || stationsRes.data?.length || 0;

      // Load users count (if API exists)
      let usersCount = 0;
      try {
        const usersRes = await api.getUsers({ limit: 1 });
        usersCount = usersRes.meta?.total || usersRes.data?.length || 0;
      } catch (err) {
        console.log('Users API not available yet');
      }

      setStats({
        totalStations: stationsCount,
        totalUsers: usersCount,
        activeStations: stationsCount, // TODO: Filter by status
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Stations</h4>
          <div className="value">{stats.totalStations}</div>
        </div>
        <div className="stat-card">
          <h4>Active Stations</h4>
          <div className="value">{stats.activeStations}</div>
        </div>
        <div className="stat-card">
          <h4>Total Users</h4>
          <div className="value">{stats.totalUsers}</div>
        </div>
      </div>

      <div className="card">
        <h3>Welcome to EV Charging Stations Admin Panel</h3>
        <p style={{ color: '#64748b', marginTop: '10px' }}>
          Manage charging stations and users from this dashboard.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

