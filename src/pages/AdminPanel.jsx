// ============================================================
// AdminPanel.js — Tabbed admin interface
// Tabs: Bookings Approval | Resources Management | Users
// ============================================================

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faTrash,
  faPlus,
  faSearch,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/Card";
import Modal from "../components/Modal";
import PageLayout from "../components/PageLayout";

const TABS = ["📋 Booking Approvals", "🏢 Facility Management", "👥 Users & Academic Roles"];

const AdminPanel = () => {
  const {
    bookingList,
    updateBookingStatus,
    resourceList,
    addResource,
    deleteResource,
    toggleResourceAvailability,
    users,
  } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState(null); // "approve" | "reject"
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    type: "Laboratory",
    location: "",
    departmentId: "",
  });
  const [addError, setAddError] = useState("");
  const [search, setSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceStatusFilter, setResourceStatusFilter] = useState("All");

  // ─── Filtered Bookings ────────────────────────────────────
  const pendingBookings = bookingList.filter((b) => b.status === "Pending");
  const allBookings = bookingList.filter(
    (b) =>
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      (getResourceName(b.resourceId) || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ─── Map resource → active booker (Pending or Approved, not ended) ───
  const now = Date.now();
  const bookedByMap = {};
  bookingList.forEach((b) => {
    if (
      ["Pending", "Approved"].includes(b.status) &&
      new Date(b.endTime).getTime() > now
    ) {
      if (!bookedByMap[b.resourceId]) {
        bookedByMap[b.resourceId] = {
          userName: b.userName || getUserName(b.userId),
          bookingId: b.id,
          status: b.status,
        };
      }
    }
  });

  // ─── Filtered Resources (for admin table) ────────────────
  const filteredResources = resourceList.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      (r.location || "").toLowerCase().includes(resourceSearch.toLowerCase()) ||
      (r.department || "").toLowerCase().includes(resourceSearch.toLowerCase());
    const matchStatus =
      resourceStatusFilter === "All" ||
      (resourceStatusFilter === "Available" && r.availability === "Available") ||
      (resourceStatusFilter === "InUse" && r.availability === "Booked");
    return matchSearch && matchStatus;
  });

  function getResourceName(rid) {
    return resourceList.find((r) => r.id === rid)?.name || "Unknown";
  }

  function getUserName(uid) {
    return users.find((u) => u.id === uid)?.name || "Unknown";
  }

  function formatDate(iso) {
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
  }

  // ─── Booking Action Modal ─────────────────────────────────
  const openAction = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
  };

  const confirmAction = async () => {
    const result = await updateBookingStatus(
      selectedBooking.id,
      actionType === "approve" ? "Approved" : "Cancelled"
    );
    if (!result?.success) {
      toast.error(result?.message || "Failed to update booking status", { autoClose: 3000 });
      setSelectedBooking(null);
      setActionType(null);
      return;
    }

    if (actionType === "approve") {
      toast.success(`✅ Booking ${selectedBooking.id} approved successfully!`, { autoClose: 3000 });
    } else {
      toast.error(`❌ Booking ${selectedBooking.id} rejected.`, { autoClose: 3000 });
    }
    setSelectedBooking(null);
    setActionType(null);
  };

  // ─── Add Resource ─────────────────────────────────────────
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError("Resource name is required.");
      return;
    }
    if (!addForm.location.trim()) {
      setAddError("Location is required.");
      return;
    }

    const selectedDepartmentId = Number(addForm.departmentId);
    if (!selectedDepartmentId || Number.isNaN(selectedDepartmentId)) {
      setAddError("Please select a department.");
      return;
    }

    const result = await addResource({
      name: addForm.name,
      type: addForm.type,
      location: addForm.location,
      departmentId: selectedDepartmentId,
    });

    if (!result?.success) {
      setAddError(result?.message || "Failed to add resource.");
      return;
    }

    setAddForm({ name: "", type: "Laboratory", location: "", departmentId: "" });
    setAddError("");
    toast.success("Resource added successfully!", { autoClose: 2500 });
  };

  const departmentOptions = Array.from(
    new Map(
      [...resourceList, ...users]
        .filter((r) => r.departmentId && r.department)
        .map((r) => [r.departmentId, { id: r.departmentId, name: r.department }])
    ).values()
  );

  const handleToggleRefresh = async () => {
    const result = await toggleResourceAvailability();
    if (result?.message) {
      toast.info(result.message, { autoClose: 2800 });
    }
  };

  const confirmDeleteResource = async () => {
    if (!deleteTarget) return;
    const result = await deleteResource(deleteTarget.id);
    if (!result?.success) {
      toast.error(result?.message || "Failed to delete resource", { autoClose: 3000 });
      return;
    }
    toast.success("Resource deleted successfully", { autoClose: 2500 });
    setDeleteTarget(null);
  };

  // ─── Role Colors ──────────────────────────────────────────
  const roleColor = (role) => {
    const map = {
      Admin: "badge-purple",
      Faculty: "badge-blue",
      Student: "badge-green",
      "Lab Assistant": "badge-yellow",
    };
    return map[role] || "badge-grey";
  };

  return (
    <PageLayout variant="default">
      <div className="page-header">
        <h2>
          <FontAwesomeIcon
            icon={faShieldHalved}
            style={{ marginRight: 10, color: "var(--brand-600)" }}
          />
          Institution Control Center
        </h2>
        <p>Oversee resource allocation across departments. Streamline booking across the campus infrastructure.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}
            id={`admin-tab-${i}`}
          >
            {tab}
            {i === 0 && pendingBookings.length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "var(--danger)",
                  color: "white",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "1px 6px",
                }}
              >
                {pendingBookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Booking Approvals ── */}
      {activeTab === 0 && (
        <div>
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search bookings…"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="admin-booking-search"
              />
            </div>
          </div>

          {allBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No bookings</h3>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Resource</th>
                    <th>Time Slot</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "var(--brand-600)",
                            fontSize: 12,
                          }}
                        >
                          {b.id}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>
                        {getUserName(b.userId)}
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {getResourceName(b.resourceId)}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {formatDate(b.startTime)} →<br />
                        {formatDate(b.endTime)}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 160 }}>
                        {b.purpose || "—"}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        {b.status === "Pending" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openAction(b, "approve")}
                              id={`approve-btn-${b.id}`}
                              title="Approve"
                            >
                              <FontAwesomeIcon icon={faCheck} /> Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => openAction(b, "reject")}
                              id={`reject-btn-${b.id}`}
                              title="Reject"
                            >
                              <FontAwesomeIcon icon={faXmark} /> Reject
                            </button>
                          </div>
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
        </div>
      )}

      {/* ── Tab 1: Resource Management ── */}
      {activeTab === 1 && (
        <div>
          {/* Add Resource Form */}
          <div className="add-resource-form">
            <h4>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8, color: "var(--brand-600)" }} />
              Add New Resource
            </h4>

            {addError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleAddResource} noValidate>
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="res-name">
                    Resource Name *
                  </label>
                  <input
                    id="res-name"
                    className="form-input"
                    placeholder="e.g., Chemistry Lab"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="res-type">
                    Type *
                  </label>
                  <select
                    id="res-type"
                    className="form-input"
                    value={addForm.type}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Hall">Hall</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="res-location">
                    Location *
                  </label>
                  <input
                    id="res-location"
                    className="form-input"
                    placeholder="e.g., Block F – Floor 2"
                    value={addForm.location}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="res-department">
                    Department *
                  </label>
                  <select
                    id="res-department"
                    className="form-input"
                    value={addForm.departmentId}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, departmentId: e.target.value }))
                    }
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                id="add-resource-btn"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Resource
              </button>
            </form>
          </div>

          {/* Resource Filter Bar */}
          <div className="filter-bar" style={{ marginBottom: 16, marginTop: 8 }}>
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search resources…"
                className="search-input"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                id="admin-resource-search"
              />
            </div>
            <select
              className="filter-select"
              value={resourceStatusFilter}
              onChange={(e) => setResourceStatusFilter(e.target.value)}
              id="admin-resource-status-filter"
            >
              <option value="All">All Status</option>
              <option value="Available">✅ Available</option>
              <option value="InUse">🔒 In Use</option>
            </select>
            <span style={{ fontSize: 13, color: "var(--text-muted)", alignSelf: "center" }}>
              {filteredResources.length} of {resourceList.length} resources
            </span>
          </div>

          {/* Resources Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Booked By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((r) => {
                  const booker = bookedByMap[r.id];
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>
                        <span className="badge badge-blue">{r.type}</span>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {r.location}
                      </td>
                      <td>
                        <span className={`badge ${r.availability === "Available" ? "badge-green" : "badge-red"}`}>
                          {r.availability === "Available" ? "✅ Available" : "🔒 In Use"}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {booker ? (
                          <div>
                            <span style={{ fontWeight: 600 }}>{booker.userName}</span>
                            <br />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {booker.bookingId} · {booker.status}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleToggleRefresh}
                            id={`toggle-avail-${r.id}`}
                            title="Refresh Availability"
                          >
                            Refresh
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(r)}
                            id={`delete-res-${r.id}`}
                            title="Delete Resource"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Users & Roles ── */}
      {activeTab === 2 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {i + 1}
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                        {u.avatar}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {u.email}
                  </td>
                  <td>
                    <span className={`badge ${roleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.department}</td>
                  <td style={{ fontSize: 13 }}>
                    {bookingList.filter((b) => b.userId === u.id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Approve / Reject Modal ── */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => {
          setSelectedBooking(null);
          setActionType(null);
        }}
        title={actionType === "approve" ? "✅ Approve Booking" : "❌ Reject Booking"}
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSelectedBooking(null);
                setActionType(null);
              }}
            >
              Cancel
            </button>
            <button
              className={`btn ${
                actionType === "approve" ? "btn-success" : "btn-danger"
              }`}
              onClick={confirmAction}
              id="confirm-action-btn"
            >
              <FontAwesomeIcon
                icon={actionType === "approve" ? faCheck : faXmark}
              />
              {actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </>
        }
      >
        {selectedBooking && (
          <div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              You are about to{" "}
              <strong>
                {actionType === "approve" ? "approve" : "reject"}
              </strong>{" "}
              this booking request:
            </p>
            <div
              style={{
                background: "var(--bg-hover)",
                borderRadius: "var(--radius-sm)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { label: "Booking ID", value: selectedBooking.id },
                { label: "User", value: getUserName(selectedBooking.userId) },
                { label: "Resource", value: getResourceName(selectedBooking.resourceId) },
                { label: "From", value: formatDate(selectedBooking.startTime) },
                { label: "To", value: formatDate(selectedBooking.endTime) },
                { label: "Purpose", value: selectedBooking.purpose || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                  }}
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

      {/* ── Delete Resource Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="🗑️ Delete Resource"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmDeleteResource}
              id="confirm-delete-btn"
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {deleteTarget.name}
            </strong>
            ? All associated bookings will remain but the resource will no longer
            be bookable.
          </p>
        )}
      </Modal>
    </PageLayout>
  );
};

export default AdminPanel;
