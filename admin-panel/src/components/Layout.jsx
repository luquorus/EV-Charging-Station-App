import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>EV Admin</h1>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/stations" className={({ isActive }) => (isActive ? 'active' : '')}>
                Stations
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                Users
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <div className="header">
          <h2>Admin Panel</h2>
          <div className="user-info">
            <span>
              {user?.fullName || user?.email} ({user?.role})
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

