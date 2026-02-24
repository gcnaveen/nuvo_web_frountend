import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, closeSidebar }) => {
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

            <li className="sidebar-item active">
              <Link to="/" className="sidebar-link">
                <i className="bi bi-grid-fill"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/events" className="sidebar-link">
                <i className="bi bi-stack"></i>
                <span>Events</span>
              </Link>
            </li>

            <li className="sidebar-item has-sub">
              <a href="#" className="sidebar-link">
                <i className="bi bi-person-badge-fill"></i>
                <span>User Management</span>
              </a>
              {/* Submenus usually require extra state to toggle in React, kept static for now */}
              <ul className="submenu" style={{ display: "block" }}>
                <li className="submenu-item">
                  <Link to="/staff" className="sidebar-link">
                    <span>Staff</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link to="makeup-artitst" className="sidebar-link">
                    <span>Makeup Artist</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link to="clients" className="sidebar-link">
                    <span>Clients</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item has-sub">
              <a href="#" className="sidebar-link">
                <i className="bi bi-grid-1x2-fill"></i>
                <span>Inventory</span>
              </a>
              <ul className="submenu" style={{ display: "block" }}>
                <li className="submenu-item">
                  <Link to="uniforms" className="sidebar-link">
                    <span>Uniforms</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a href="ui-file-uploader.html" className="sidebar-link">
                <i className="bi bi-cloud-arrow-up-fill"></i>
                <Link to="master-data" className="sidebar-link">
                  <span>Master Data</span>
                </Link>
              </a>
            </li>

            <li className="sidebar-item">
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
