// ============================================================
// Card.jsx — Reusable stat card and resource card components
// Campus-themed design with department grouping support
// ============================================================

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faArrowTrendDown } from "@fortawesome/free-solid-svg-icons";

/**
 * StatCard — Dashboard overview numbers with campus-styled icons
 */
export const StatCard = ({ icon, color = "blue", value, label, change, trend, emoji }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      {emoji ? (
        <span style={{ fontSize: 22 }}>{emoji}</span>
      ) : (
        <FontAwesomeIcon icon={icon} />
      )}
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
      {change && (
        <span className={`stat-change ${trend}`}>
          {icon && <FontAwesomeIcon icon={trend === "up" ? faArrowTrendUp : faArrowTrendDown} />}
          {change}
        </span>
      )}
    </div>
  </div>
);

/**
 * ResourceCard — Campus resource card with department badge
 * Uses emoji icons directly from resource data (no icon mapping needed)
 */
export const ResourceCard = ({ resource, actions }) => {
  const isAvailable = resource.availability === "Available";

  return (
    <div className="resource-card">
      {/* Colored top bar using dept color */}
      <div
        className="resource-card-accent"
        style={{ background: resource.deptColor || "var(--brand-500)" }}
      />

      <div className="resource-card-top">
        <div
          className="resource-icon"
          style={{
            background: (resource.deptColor || "#3b82f6") + "18",
            border: `1px solid ${(resource.deptColor || "#3b82f6")}30`,
          }}
        >
          <span style={{ fontSize: 22 }}>{resource.icon || "📋"}</span>
        </div>
        <span className={`badge ${isAvailable ? "badge-green" : "badge-red"}`}>
          {isAvailable ? "● Available" : "● Booked"}
        </span>
      </div>

      <h4>{resource.name}</h4>

      {/* Department badge */}
      {resource.department && (
        <div
          className="dept-badge"
          style={{
            background: (resource.deptColor || "#3b82f6") + "15",
            color: resource.deptColor || "var(--brand-600)",
            borderColor: (resource.deptColor || "#3b82f6") + "30",
          }}
        >
          {resource.department}
        </div>
      )}

      <div className="resource-meta">
        <div className="resource-meta-item">
          <span>🏷️</span>
          <span>{resource.type}</span>
        </div>
        <div className="resource-meta-item">
          <span>📍</span>
          <span>{resource.location}</span>
        </div>
        <div className="resource-meta-item">
          <span>🪑</span>
          <span>Capacity: {resource.capacity}</span>
        </div>
      </div>

      {actions && <div style={{ marginTop: 12 }}>{actions}</div>}
    </div>
  );
};

/**
 * StatusBadge — color-coded booking status pill
 */
export const StatusBadge = ({ status }) => {
  const map = {
    Approved: "badge-green",
    Pending: "badge-yellow",
    Cancelled: "badge-red",
  };
  return (
    <span className={`badge ${map[status] || "badge-grey"}`}>{status}</span>
  );
};

export default { StatCard, ResourceCard, StatusBadge };
