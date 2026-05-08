// ============================================================
// Dashboard.js — Main overview page
// Shows stats, recent bookings, quick actions
// ============================================================

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faServer,
  faClock,
  faCircleCheck,
  faCalendarPlus,
  faList,
  faUsersCog,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";
import { StatCard, StatusBadge } from "../components/Card";
import Hero from "../components/Hero";
import PageLayout from "../components/PageLayout";

const Dashboard = () => {
  const { currentUser, bookingList, resourceList, users } = useApp();
  const navigate = useNavigate();

  // ─── Computed Stats ─────────────────────────────────────
  const stats = useMemo(() => {
    const myBookings = bookingList.filter((b) => b.userId === currentUser?.id);
    const totalBookings =
      currentUser?.role === "Admin" ? bookingList.length : myBookings.length;
    const available = resourceList.filter(
      (r) => r.availability === "Available"
    ).length;
    const pending = bookingList.filter((b) => b.status === "Pending").length;
    const approved = bookingList.filter((b) => b.status === "Approved").length;

    return { totalBookings, available, pending, approved };
  }, [bookingList, resourceList, currentUser]);

  // ─── Recent Activity ─────────────────────────────────────
  const recentBookings = useMemo(() => {
    const visible =
      currentUser?.role === "Admin"
        ? bookingList
        : bookingList.filter((b) => b.userId === currentUser?.id);
    return [...visible].reverse().slice(0, 5);
  }, [bookingList, currentUser]);

  const getResourceName = (rid) =>
    resourceList.find((r) => r.id === rid)?.name || "Unknown";

  const getUserName = (uid, fallbackName) =>
    users.find((u) => u.id === uid)?.name || fallbackName || "Unknown";

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const dotColor = (status) => {
    const map = {
      Approved: "var(--success)",
      Pending: "var(--warning)",
      Cancelled: "var(--danger)",
    };
    return map[status] || "var(--text-muted)";
  };

  return (
    <PageLayout variant="dashboard" style={{ padding: 0 }}>
      {/* ── Hero Section ── */}
      <Hero currentUser={currentUser} />

      {/* ── Dashboard Content ── */}
      <div className="dashboard-inner">
        {/* Welcome header */}
        <div className="page-header" style={{ marginBottom: 24 }}>
          <h2>Welcome to your Smart Campus Dashboard</h2>
          <p>
            Monitor and manage all institutional resources in one place. ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="dashboard-tagline-banner">
            <span>🔒</span>
            <span>GateKeeperX &mdash; <em>"Smart Access. Seamless Control."</em></span>
          </div>
        </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          emoji="📅"
          color="blue"
          value={stats.totalBookings}
          label={currentUser?.role === "Admin" ? "Campus Bookings" : "My Reservations"}
          change="+2 this week"
          trend="up"
        />
        <StatCard
          emoji="🏢"
          color="green"
          value={stats.available}
          label="Available Facilities"
          change={`${resourceList.length} total`}
          trend="up"
        />
        <StatCard
          emoji="⏳"
          color="yellow"
          value={stats.pending}
          label="Pending Approvals"
        />
        <StatCard
          emoji="✅"
          color="purple"
          value={stats.approved}
          label="Approved Bookings"
          change="All time"
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3>
              <FontAwesomeIcon icon={faWaveSquare} style={{ marginRight: 8, color: "var(--brand-500)" }} />
              Recent Activity
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/my-bookings")}
            >
              View All
            </button>
          </div>
          <div className="card-body" style={{ padding: "8px 24px 20px" }}>
            {recentBookings.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <div className="empty-icon" style={{ width: 56, height: 56, fontSize: 22 }}>📅</div>
                <h3 style={{ fontSize: 15 }}>No bookings yet</h3>
                <p style={{ fontSize: 13 }}>Start by booking a resource</p>
              </div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="activity-item">
                  <div
                    className="activity-dot"
                    style={{ background: dotColor(b.status) }}
                  />
                  <div className="activity-text">
                    <p>
                      {currentUser?.role === "Admin"
                        ? `${getUserName(b.userId, b.userName)} booked `
                        : "You booked "}
                      <strong>{getResourceName(b.resourceId) || b.resourceName || "Unknown"}</strong>
                    </p>
                    <small>
                      {b.id} · {formatTime(b.startTime)} → {formatTime(b.endTime)}
                    </small>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => navigate("/book")}
                id="qa-book"
              >
                <div className="quick-action-icon" style={{ background: "var(--brand-50)", color: "var(--brand-600)" }}>
                  📅
                </div>
                Reserve a Facility
              </button>

              <button
                className="quick-action-btn"
                onClick={() => navigate("/my-bookings")}
                id="qa-bookings"
              >
                <div className="quick-action-icon" style={{ background: "var(--info-bg)", color: "var(--info)" }}>
                  📋
                </div>
                My Reservations
              </button>

              <button
                className="quick-action-btn"
                onClick={() => navigate("/resources")}
                id="qa-resources"
              >
                <div className="quick-action-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                  🏫
                </div>
                Browse Campus Facilities
              </button>

              {currentUser?.role === "Admin" && (
                <button
                  className="quick-action-btn"
                  onClick={() => navigate("/admin")}
                  id="qa-admin"
                >
                  <div className="quick-action-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>
                    🏛️
                  </div>
                  Institution Control
                </button>
              )}
            </div>

            {/* Resource Usage mini-summary */}
            <div style={{ marginTop: 24 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 12,
                }}
              >
                Resource Usage
              </p>
              {["Lab", "Hall", "Equipment"].map((type) => {
                const total = resourceList.filter((r) => r.type === type).length;
                const booked = resourceList.filter(
                  (r) => r.type === type && r.availability === "Booked"
                ).length;
                const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
                return (
                  <div key={type} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{type}s</span>
                      <span style={{ color: "var(--text-muted)" }}>{booked}/{total} booked</span>
                    </div>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--brand-500)",
                          borderRadius: 999,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>{/* end .dashboard-inner */}
    </PageLayout>
  );
};

export default Dashboard;
