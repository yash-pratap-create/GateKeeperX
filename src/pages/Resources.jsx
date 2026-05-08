// ============================================================
// Resources.jsx — Campus Academic Resource Browser
// Grouped by Department, filterable by Type & Availability
// ============================================================

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendarPlus, faLayerGroup, faList } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";
import { ResourceCard } from "../components/Card";
import PageLayout from "../components/PageLayout";

const DEPT_ICONS = ["🏛️", "🧪", "💻", "🔬", "⚙️", "📚", "🏢", "🧰"];
const DEPT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#14b8a6",
  "#64748b",
];

const getDeptMeta = (deptName) => {
  const text = deptName || "General";
  const seed = text.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return {
    icon: DEPT_ICONS[seed % DEPT_ICONS.length],
    color: DEPT_COLORS[seed % DEPT_COLORS.length],
  };
};

const Resources = () => {
  const { resourceList, currentUser } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [availFilter, setAvailFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [viewMode, setViewMode] = useState("department"); // "department" | "grid"

  // ─── Filtered Resources ───────────────────────────────────
  const filtered = useMemo(() => {
    return resourceList.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase()) ||
        (r.department || "").toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || r.type === typeFilter;
      const matchAvail = availFilter === "All" || r.availability === availFilter;
      const matchDept = deptFilter === "All" || r.department === deptFilter;
      return matchSearch && matchType && matchAvail && matchDept;
    });
  }, [resourceList, search, typeFilter, availFilter, deptFilter]);

  // ─── Group by Department ──────────────────────────────────
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const dept = r.department || "General";
      if (!map[dept]) map[dept] = [];
      map[dept].push(r);
    });
    return map;
  }, [filtered]);

  const handleBookNow = (resourceId) => {
    navigate(`/book?resource=${resourceId}`);
  };

  // Collect all departments present in data
  const activeDepts = useMemo(() => {
    const set = new Set(resourceList.map((r) => r.department).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [resourceList]);

  const ResourceAction = ({ resource }) => {
    if (resource.availability === "Available" && currentUser?.role !== "Lab Assistant") {
      return (
        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "10px" }}
          onClick={() => handleBookNow(resource.id)}
          id={`book-btn-${resource.id}`}
        >
          <FontAwesomeIcon icon={faCalendarPlus} />
          Reserve Now
        </button>
      );
    }
    if (resource.availability === "Booked") {
      return (
        <div className="currently-booked-banner">
          🔒 Currently in Use
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout variant="default">
      {/* Campus-style page header */}
      <div className="page-header campus-page-header">
        <div className="campus-header-text">
          <h2>🏫 Campus Facilities & Resources</h2>
          <p>Optimize lab and facility usage across all departments.</p>
          <p className="campus-sub" style={{ marginTop: 6 }}>
            <strong>{resourceList.filter(r => r.availability === "Available").length}</strong> available ·{" "}
            <strong>{resourceList.filter(r => r.availability === "Booked").length}</strong> in use ·{" "}
            <strong>{resourceList.length}</strong> total facilities
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="resource-stats-strip">
        {[
          { type: "Laboratory", label: "Labs",      icon: "🧪" },
          { type: "Hall",       label: "Halls",     icon: "🏛️" },
          { type: "Equipment", label: "Equipment", icon: "🔧" },
          { type: "Workshop",  label: "Workshops", icon: "🔨" },
        ].map(({ type, label, icon }) => {
          const count = resourceList.filter((r) => r.type === type).length;
          const avail = resourceList.filter((r) => r.type === type && r.availability === "Available").length;
          if (count === 0) return null;
          return (
            <div key={type} className="resource-stat-chip">
              <span className="chip-icon">{icon}</span>
              <div>
                <strong>{label}</strong>
                <small>{avail}/{count} available</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {/* Search */}
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, location, or department…"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="resource-search"
          />
        </div>

        {/* Department filter */}
        <select
          className="filter-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          id="dept-filter"
        >
          {activeDepts.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>

        {/* Type filter */}
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          id="type-filter"
        >
          <option value="All">All Types</option>
          <option value="Laboratory">🧪 Labs</option>
          <option value="Hall">🏛️ Halls</option>
          <option value="Equipment">🔧 Equipment</option>
          <option value="Workshop">🔨 Workshops</option>
        </select>

        {/* Availability filter */}
        <select
          className="filter-select"
          value={availFilter}
          onChange={(e) => setAvailFilter(e.target.value)}
          id="avail-filter"
        >
          <option value="All">All Status</option>
          <option value="Available">✅ Available</option>
          <option value="Booked">🔒 In Use</option>
        </select>

        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "department" ? "active" : ""}`}
            onClick={() => setViewMode("department")}
            title="Group by Department"
            id="view-dept-btn"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
            id="view-grid-btn"
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No facilities found</h3>
          <p>Try adjusting your search or filters to find campus resources</p>
        </div>
      )}

      {/* ─── Department Grouped View ─── */}
      {viewMode === "department" && filtered.length > 0 && (
        <div className="dept-sections">
          {Object.entries(grouped).map(([dept, items]) => {
            const meta = getDeptMeta(dept);
            return (
              <div key={dept} className="dept-section">
                {/* Department section header */}
                <div
                  className="dept-section-header"
                  style={{ borderLeftColor: meta.color }}
                >
                  <div
                    className="dept-section-icon"
                    style={{ background: meta.color + "18", color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h3>{dept}</h3>
                    <p>
                      {items.length} facilit{items.length === 1 ? "y" : "ies"} ·{" "}
                      {items.filter((r) => r.availability === "Available").length} available
                    </p>
                  </div>
                  <div className="dept-section-badges" style={{ marginLeft: "auto" }}>
                    {[
                      { type: "Laboratory", label: "Lab" },
                      { type: "Hall",       label: "Hall" },
                      { type: "Equipment", label: "Equip" },
                      { type: "Workshop",  label: "Workshop" },
                    ].map(({ type, label }) => {
                      const c = items.filter((r) => r.type === type).length;
                      return c > 0 ? (
                        <span key={type} className="badge badge-grey" style={{ fontSize: 10 }}>
                          {c} {label}{c > 1 ? "s" : ""}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Resources grid within department */}
                <div className="resources-grid">
                  {items.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      actions={<ResourceAction resource={resource} />}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Flat Grid View ─── */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="resources-grid">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              actions={<ResourceAction resource={resource} />}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Resources;
