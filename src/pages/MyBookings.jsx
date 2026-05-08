// ============================================================
// MyBookings.js — User's personal booking history
// Table with status badges, cancel action, filterable
// ============================================================

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBan,
  faCalendarTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/Card";
import Modal from "../components/Modal";
import PageLayout from "../components/PageLayout";

const MyBookings = () => {
  const { bookingList, cancelBooking, currentUser, resourceList } = useApp();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null); // booking to cancel

  // ─── Filter Bookings ──────────────────────────────────────
  const myBookings = useMemo(() => {
    const base =
      currentUser?.role === "Admin"
        ? bookingList
        : bookingList.filter((b) => b.userId === currentUser?.id);

    return base.filter((b) => {
      const resourceName =
        resourceList.find((r) => r.id === b.resourceId)?.name || "";
      const matchSearch =
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        resourceName.toLowerCase().includes(search.toLowerCase()) ||
        b.purpose?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookingList, currentUser, search, statusFilter, resourceList]);

  const getResourceName = (rid) =>
    resourceList.find((r) => r.id === rid)?.name || "Unknown";

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const handleCancelConfirm = async () => {
    await cancelBooking(cancelTarget.id);
    setCancelTarget(null);
  };

  return (
    <PageLayout variant="default">
      <div className="page-header">
        <h2>📋 {currentUser?.role === "Admin" ? "All Bookings" : "My Bookings"}</h2>
        <p>{myBookings.length} booking(s) found</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, resource, or purpose…"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="booking-search"
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="status-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {myBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FontAwesomeIcon icon={faCalendarTimes} />
          </div>
          <h3>No bookings found</h3>
          <p>
            {search || statusFilter !== "All"
              ? "Try adjusting your search or filters"
              : "You haven't made any bookings yet"}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Resource</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.map((b) => (
                <tr key={b.id} id={`booking-row-${b.id}`}>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "var(--brand-600)",
                        fontSize: 13,
                      }}
                    >
                      {b.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {getResourceName(b.resourceId)}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {formatDate(b.startTime)}
                  </td>
                  <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {formatDate(b.endTime)}
                  </td>
                  <td
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      maxWidth: 200,
                    }}
                  >
                    {b.purpose || "—"}
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td>
                    {b.status !== "Cancelled" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setCancelTarget(b)}
                        id={`cancel-btn-${b.id}`}
                        title="Cancel booking"
                      >
                        <FontAwesomeIcon icon={faBan} />
                        Cancel
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setCancelTarget(null)}
            >
              Keep It
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancelConfirm}
              id="confirm-cancel-btn"
            >
              <FontAwesomeIcon icon={faBan} />
              Yes, Cancel
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
            <div
              style={{
                background: "var(--bg-hover)",
                borderRadius: "var(--radius-sm)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                { label: "Booking ID", value: cancelTarget.id },
                {
                  label: "Resource",
                  value: getResourceName(cancelTarget.resourceId),
                },
                { label: "From", value: formatDate(cancelTarget.startTime) },
                { label: "To", value: formatDate(cancelTarget.endTime) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
                >
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default MyBookings;
