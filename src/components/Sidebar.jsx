// ============================================================
// Sidebar.js — Collapsible navigation sidebar
// Handles role-based nav items, user profile, logout
// ============================================================

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faCalendarPlus,
  faCalendarCheck,
  faServer,
  faShield,
  faUsersCog,
  faRightFromBracket,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";

// Navigation items with role access control
const NAV_ITEMS = [
  {
    label: "🏠 Dashboard",
    icon: faGauge,
    path: "/dashboard",
    roles: ["Admin", "Faculty", "Student", "Lab Assistant"],
  },
  {
    label: "📅 Book Resource",
    icon: faCalendarPlus,
    path: "/book",
    roles: ["Admin", "Faculty", "Student", "Lab Assistant"],
  },
  {
    label: "📋 My Bookings",
    icon: faCalendarCheck,
    path: "/my-bookings",
    roles: ["Admin", "Faculty", "Student", "Lab Assistant"],
  },
  {
    label: "🏢 Resources",
    icon: faServer,
    path: "/resources",
    roles: ["Admin", "Faculty", "Student", "Lab Assistant"],
  },
];

const ADMIN_ITEMS = [
  {
    label: "⚙️ Admin Panel",
    icon: faUsersCog,
    path: "/admin",
    roles: ["Admin"],
  },
  {
    label: "🔐 Permissions",
    icon: faLock,
    path: "/permissions",
    roles: ["Admin"],
  },
];

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { currentUser, logout, sidebarOpen, darkMode } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = currentUser?.role === "Admin";

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onMobileClose} />
      )}

      <aside
        className={`sidebar ${!sidebarOpen ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""
          }`}
      >
        {/* Logo / Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FontAwesomeIcon icon={faShield} />
          </div>
          <div className="sidebar-logo-text">
            <h2>
              Gate<span>Keeper</span>X
            </h2>
            <p className="sidebar-tagline">Smart Access. Seamless Control.</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Main Menu</p>

          {NAV_ITEMS.filter((item) =>
            item.roles.includes(currentUser?.role)
          ).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={onMobileClose}
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="nav-icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}

          {/* Admin-only section */}
          {isAdmin && (
            <>
              <p className="nav-section-label" style={{ marginTop: 16 }}>
                Administration
              </p>
              {ADMIN_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={onMobileClose}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <span className="nav-icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User Profile + Logout */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{currentUser?.avatar}</div>
            <div className="user-info">
              <strong>{currentUser?.name}</strong>
              <small>{currentUser?.role} · {currentUser?.department}</small>
            </div>
          </div>

          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ width: "100%", marginTop: 6, color: "var(--danger)" }}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <span className="nav-icon">
              <FontAwesomeIcon icon={faRightFromBracket} />
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
