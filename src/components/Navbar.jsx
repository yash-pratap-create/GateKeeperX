// ============================================================
// Navbar.js — Top navigation bar
// Sidebar toggle, page title, dark mode, logout shortcut
// ============================================================

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMoon,
  faSun,
  faBell,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";

// Page title/description map
const PAGE_META = {
  "/dashboard": { title: "Dashboard", sub: "Overview of your activity" },
  "/book": { title: "Book a Resource", sub: "Reserve labs, halls, and equipment" },
  "/my-bookings": { title: "My Bookings", sub: "Track and manage your reservations" },
  "/resources": { title: "Resources", sub: "Browse all available college resources" },
  "/admin": { title: "Admin Panel", sub: "Manage bookings, resources, and users" },
  "/permissions": { title: "Permissions", sub: "Role-based access control overview" },
};

const Navbar = ({ onMenuClick }) => {
  const { darkMode, setDarkMode, logout, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const meta = PAGE_META[location.pathname] || {
    title: "GateKeeperX",
    sub: "College Resource Management",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDark = () => {
    setDarkMode((d) => !d);
    document.documentElement.setAttribute(
      "data-theme",
      !darkMode ? "dark" : "light"
    );
  };

  return (
    <header className="navbar">
      {/* Sidebar hamburger toggle */}
      <button
        className="navbar-toggle"
        onClick={onMenuClick}
        title="Toggle Sidebar"
        id="sidebar-toggle-btn"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Page Title */}
      <div className="navbar-title">
        <h3>{meta.title}</h3>
        <p>{meta.sub}</p>
      </div>

      {/* Right Actions */}
      <div className="navbar-actions">
        {/* Dark Mode Toggle */}
        <button
          className="icon-btn theme-toggle"
          onClick={toggleDark}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          id="theme-toggle-btn"
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>

        {/* Notification Bell (decorative) */}
        <button className="icon-btn" title="Notifications" id="notif-btn">
          <FontAwesomeIcon icon={faBell} />
        </button>

        {/* Quick Logout */}
        <button
          className="icon-btn"
          onClick={handleLogout}
          title="Logout"
          id="logout-btn"
          style={{ color: "var(--danger)" }}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
