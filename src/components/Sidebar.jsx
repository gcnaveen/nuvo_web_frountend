import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "/") return pathname === "/" ? "active" : "";
    return pathname.startsWith(path) ? "active" : "";
  };

  // Parent only gets "active" if we're directly on one of its children
  // but NOT via the child's own active class — just keeps it open/expanded
  const isParentOpen = (...paths) => paths.some((p) => pathname.startsWith(p));

  return (
    <div id="sidebar" className={isOpen ? "active" : ""}>
      <div className="sidebar-wrapper active">
        <div className="sidebar-header">
          <div className="d-flex justify-content-between">
            <div className="logo">
              <Link to="/">Nuvo</Link>
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
            <li className={`sidebar-item ${isActive("/")}`}>
              <Link to="/" className="sidebar-link">
                <i className="bi bi-grid-fill"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Events */}
            <li className={`sidebar-item ${isActive("/events")}`}>
              <Link to="/events" className="sidebar-link">
                <i className="bi bi-stack"></i>
                <span>Events</span>
              </Link>
            </li>

            {/* User Management — parent never gets "active", only "open" */}
            <li
              className={`sidebar-item has-sub ${isParentOpen("/staff", "/makeup-artist", "/clients") ? "open" : ""}`}
            >
              <a href="#" className="sidebar-link">
                <i className="bi bi-person-badge-fill"></i>
                <span>User Management</span>
              </a>
              <ul className="submenu" style={{ display: "block" }}>
                <li className={`submenu-item ${isActive("/staff")}`}>
                  <Link to="/staff" className="sidebar-link">
                    <span>Staff</span>
                  </Link>
                </li>
                <li className={`submenu-item ${isActive("/makeup-artist")}`}>
                  <Link to="/makeup-artist" className="sidebar-link">
                    <span>Makeup Artist</span>
                  </Link>
                </li>
                <li className={`submenu-item ${isActive("/clients")}`}>
                  <Link to="/clients" className="sidebar-link">
                    <span>Clients</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Inventory */}
            <li
              className={`sidebar-item has-sub ${isParentOpen("/uniforms") ? "open" : ""}`}
            >
              <a href="#" className="sidebar-link">
                <i className="bi bi-grid-1x2-fill"></i>
                <span>Inventory</span>
              </a>
              <ul className="submenu" style={{ display: "block" }}>
                <li className={`submenu-item ${isActive("/uniforms")}`}>
                  <Link to="/uniforms" className="sidebar-link">
                    <span>Uniforms</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Master Data */}
            <li className={`sidebar-item ${isActive("/master-data")}`}>
              <Link to="/master-data" className="sidebar-link">
                <i className="bi bi-cloud-arrow-up-fill"></i>
                <span>Master Data</span>
              </Link>
            </li>

            {/* Reports */}
            <li className={`sidebar-item ${isActive("/reports")}`}>
              <Link to="/reports" className="sidebar-link">
                <i className="bi bi-file-earmark-medical-fill"></i>
                <span>Reports</span>
              </Link>
            </li>
          </ul>
        </div>

        <button className="sidebar-toggler btn x" onClick={closeSidebar}>
          <i data-feather="x"></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
