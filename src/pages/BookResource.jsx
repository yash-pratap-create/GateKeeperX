// ============================================================
// BookResource.js — Booking form with transaction simulation
// Implements: time overlap check, commit/rollback, validation
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarPlus,
  faCheckCircle,
  faTriangleExclamation,
  faInfoCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";

const BookResource = () => {
  const { resourceList, createBooking, currentUser, bookingList } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-select resource from URL param (e.g., /book?resource=1)
  const preSelectedId = searchParams.get("resource");

  const [form, setForm] = useState({
    resourceId: preSelectedId ? Number(preSelectedId) : "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const [alert, setAlert] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);

  // Clear alert after 4s
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(t);
  }, [alert]);

  // Update resourceId when URL param changes
  useEffect(() => {
    if (preSelectedId) {
      setForm((f) => ({ ...f, resourceId: Number(preSelectedId) }));
    }
  }, [preSelectedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "resourceId" ? Number(value) : value,
    }));
  };

  // ── Form Validation ──────────────────────────────────────
  const validate = () => {
    if (!form.resourceId) return "Please select a resource.";
    if (!form.startTime) return "Please enter a start time.";
    if (!form.endTime) return "Please enter an end time.";

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    const now = new Date();

    if (start <= now) return "Start time must be in the future.";
    if (end <= start) return "End time must be after start time.";

    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 8) return "Booking duration cannot exceed 8 hours.";

    // Role-based time restrictions
    if (currentUser?.role === "Student" && durationHours > 2) {
      return "Students can book for a maximum of 2 hours.";
    }

    return null;
  };

  // ── Show existing bookings for selected resource ──────────
  const existingBookings = form.resourceId
    ? bookingList.filter(
      (b) =>
        b.resourceId === Number(form.resourceId) &&
        b.status !== "Cancelled"
    )
    : [];

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

  // ── Submit Handler (Transaction Simulation) ──────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setAlert({ type: "error", message: err });
      return;
    }

    setLoading(true);

    // Show "Processing" toast while simulating async transaction
    const processingToast = toast.loading("Processing your request…", {
      toastId: "booking-processing",
    });

    await new Promise((r) => setTimeout(r, 800));

    const result = await createBooking(
      Number(form.resourceId),
      form.startTime,
      form.endTime,
      form.purpose
    );

    setLoading(false);

    if (result.success) {
      // COMMIT — show success
      toast.update(processingToast, {
        render: "Booking Confirmed 🎉",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setAlert({ type: "success", message: "Booking Confirmed 🎉 Your reservation has been submitted for approval." });
      setForm({ resourceId: "", startTime: "", endTime: "", purpose: "" });
      setTimeout(() => navigate("/my-bookings"), 1800);
    } else {
      // ROLLBACK — show conflict error
      toast.update(processingToast, {
        render: "Resource already booked ❌",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      setAlert({ type: "error", message: "Resource already booked ❌ " + result.message });
    }
  };

  const selectedResource = resourceList.find(
    (r) => r.id === Number(form.resourceId)
  );

  // Min date-time: now
  const minDateTime = new Date()
    .toISOString()
    .slice(0, 16);

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📅 Book a Resource</h2>
        <p>
          Reserve labs, halls, and equipment with real-time availability. Centralized booking for academic infrastructure.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, maxWidth: 900 }}>
        {/* Booking Form */}
        <div className="form-card">
          {/* Alert */}
          {alert && (
            <div
              className={`alert ${alert.type === "success" ? "alert-success" : "alert-error"
                }`}
              id="booking-alert"
            >
              <FontAwesomeIcon
                icon={
                  alert.type === "success"
                    ? faCheckCircle
                    : faTriangleExclamation
                }
              />
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Resource Dropdown */}
            <div className="form-group">
              <label className="form-label" htmlFor="resourceId">
                Select Resource *
              </label>
              <select
                id="resourceId"
                name="resourceId"
                className="form-input"
                value={form.resourceId}
                onChange={handleChange}
                required
              >
                <option value="">— Choose a resource —</option>
                {resourceList.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                    disabled={r.availability === "Booked"}
                  >
                    {r.name} ({r.type}) — {r.availability}
                    {r.availability === "Booked" ? " ⚠️" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="startTime">
                  Start Date & Time *
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  className="form-input"
                  value={form.startTime}
                  onChange={handleChange}
                  min={minDateTime}
                  required
                />
                <p className="form-hint">Must be a future time</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endTime">
                  End Date & Time *
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  className="form-input"
                  value={form.endTime}
                  onChange={handleChange}
                  min={form.startTime || minDateTime}
                  required
                />
                {currentUser?.role === "Student" && (
                  <p className="form-hint">⚠️ Students: max 2 hours</p>
                )}
              </div>
            </div>

            {/* Purpose */}
            <div className="form-group">
              <label className="form-label" htmlFor="purpose">
                Purpose / Description
              </label>
              <textarea
                id="purpose"
                name="purpose"
                className="form-input"
                rows={3}
                placeholder="e.g., Lab session for Advanced Programming, Guest lecture by Dr. Sharma…"
                value={form.purpose}
                onChange={handleChange}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="section-divider" />

            {/* Transaction Info */}
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>
                <strong>Academic Booking Policy:</strong> Reservations are validated for conflicts and
                submitted for institutional approval. Overlapping bookings will be automatically
                declined (rollback). Approved bookings appear in your schedule.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="submit-booking-btn"
              style={{ paddingLeft: 28, paddingRight: 28 }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Processing your request…
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCalendarPlus} />
                  Confirm Booking
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resource Info Panel */}
        <div>
          {selectedResource && (
            <div
              className="card"
              style={{
                marginBottom: 16,
                borderTop: "3px solid var(--brand-500)",
              }}
            >
              <div className="card-body">
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 12,
                  }}
                >
                  Selected Resource
                </p>
                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  {selectedResource.name}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Type", value: selectedResource.type },
                    { label: "Location", value: selectedResource.location },
                    { label: "Capacity", value: selectedResource.capacity },
                    {
                      label: "Status",
                      value: selectedResource.availability,
                    },
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
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            value === "Available"
                              ? "var(--success)"
                              : value === "Booked"
                                ? "var(--danger)"
                                : "var(--text-primary)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Existing Bookings for this resource */}
          {existingBookings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: 14 }}>
                  ⚠️ Existing Bookings
                </h3>
              </div>
              <div
                className="card-body"
                style={{ padding: "12px 16px", maxHeight: 280, overflowY: "auto" }}
              >
                {existingBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      padding: "10px 0",
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {b.id}
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      {formatTime(b.startTime)} →{" "}
                      {formatTime(b.endTime)}
                    </div>
                    <div style={{ marginTop: 3 }}>
                      <span
                        className={`badge badge-${b.status === "Approved"
                          ? "green"
                          : b.status === "Pending"
                            ? "yellow"
                            : "red"
                          }`}
                        style={{ fontSize: 10, padding: "2px 8px" }}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookResource;
