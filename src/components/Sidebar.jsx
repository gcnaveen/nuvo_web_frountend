import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path) => (pathname.startsWith(path) ? 'active' : '');
  const isParentOpen = (...paths) => paths.some((p) => pathname.startsWith(p));

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div
      id="sidebar"
      className={isOpen ? 'active' : ''}
    >
      <div className="sidebar-wrapper active">
        <div className="sidebar-header">
          <div className="d-flex justify-content-between">
            <div className="logo">
              <Link to="/admin">Nuvo</Link>
            </div>
            <div className="toggler">
              <a
                href="#"
                className="sidebar-hide d-xl-none d-block"
                onClick={closeSidebar}
              >
                <i className="bi bi-x bi-middle"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="sidebar-menu">
          <ul className="menu">
            <li className="sidebar-title">Menu</li>

            {/* Dashboard */}
            <li
              className={`sidebar-item ${isActive('/admin') && !isParentOpen('/admin/events', '/admin/staff', '/admin/makeup-artist', '/admin/clients', '/admin/uniforms', '/admin/master-data', '/admin/reports') ? 'active' : ''}`}
            >
              <Link
                to="/admin"
                className="sidebar-link"
              >
                <i className="bi bi-grid-fill"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Events */}
            <li className={`sidebar-item ${isActive('/admin/events')}`}>
              <Link
                to="/admin/events"
                className="sidebar-link"
              >
                <i className="bi bi-stack"></i>
                <span>Events</span>
              </Link>
            </li>

            {/* User Management */}
            <li
              className={`sidebar-item has-sub ${isParentOpen('/admin/staff', '/admin/makeup-artist', '/admin/clients') ? 'open' : ''}`}
            >
              <a
                href="#"
                className="sidebar-link"
              >
                <i className="bi bi-person-badge-fill"></i>
                <span>User Management</span>
              </a>
              <ul
                className="submenu"
                style={{ display: 'block' }}
              >
                <li className={`submenu-item ${isActive('/admin/staff')}`}>
                  <Link
                    to="/admin/staff"
                    className="sidebar-link"
                  >
                    <span>Staff</span>
                  </Link>
                </li>
                <li
                  className={`submenu-item ${isActive('/admin/makeup-artist')}`}
                >
                  <Link
                    to="/admin/makeup-artist"
                    className="sidebar-link"
                  >
                    <span>Makeup Artist</span>
                  </Link>
                </li>
                <li className={`submenu-item ${isActive('/admin/clients')}`}>
                  <Link
                    to="/admin/clients"
                    className="sidebar-link"
                  >
                    <span>Clients</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Inventory */}
            <li
              className={`sidebar-item has-sub ${isParentOpen('/admin/uniforms') ? 'open' : ''}`}
            >
              <a
                href="#"
                className="sidebar-link"
              >
                <i className="bi bi-grid-1x2-fill"></i>
                <span>Inventory</span>
              </a>
              <ul
                className="submenu"
                style={{ display: 'block' }}
              >
                <li className={`submenu-item ${isActive('/admin/uniforms')}`}>
                  <Link
                    to="/admin/uniforms"
                    className="sidebar-link"
                  >
                    <span>Uniforms</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Master Data */}
            <li className={`sidebar-item ${isActive('/admin/master-data')}`}>
              <Link
                to="/admin/master-data"
                className="sidebar-link"
              >
                <i className="bi bi-cloud-arrow-up-fill"></i>
                <span>Master Data</span>
              </Link>
            </li>

            {/* Reports */}
            <li className={`sidebar-item ${isActive('/admin/reports')}`}>
              <Link
                to="/admin/reports"
                className="sidebar-link"
              >
                <i className="bi bi-file-earmark-medical-fill"></i>
                <span>Reports</span>
              </Link>
            </li>

            {/* Logout */}
            <li className="sidebar-item mt-4">
              <a
                className="sidebar-link text-danger"
                style={{ cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>

        <button
          className="sidebar-toggler btn x"
          onClick={closeSidebar}
        >
          <i data-feather="x"></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
