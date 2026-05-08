// ============================================================
// AppContext.js — Global State Management via Context API
// Provides auth state, dark mode, bookings, resources globally
// ============================================================

import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TYPE_ICONS = {
  Laboratory: "🧪",
  Workshop: "🔨",
  Hall: "🏛️",
  Equipment: "🔧",
};

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

const toAvatar = (name = "U") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("") || "U";

const toBookingId = (id) => `BK-${String(id).padStart(3, "0")}`;

const parseBookingId = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;
  if (value.startsWith("BK-")) return Number(value.replace("BK-", ""));
  return Number(value);
};

const deptColorFromName = (departmentName = "General") => {
  const sum = departmentName
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return DEPT_COLORS[sum % DEPT_COLORS.length];
};

const mapBooking = (b) => ({
  bookingId: b.booking_id,
  id: toBookingId(b.booking_id),
  userId: b.user_id,
  userName: b.user_name,
  userEmail: b.user_email,
  resourceId: b.resource_id,
  resourceName: b.resource_name,
  resourceType: b.resource_type,
  startTime: b.start_time,
  endTime: b.end_time,
  status: b.status,
  purpose: b.purpose || "",
});

// A resource is considered Booked if it has any Pending/Approved booking
// that hasn't ended yet (covers both currently active and upcoming slots)
const isBookedOrUpcoming = (endTime) => {
  return new Date(endTime).getTime() > Date.now();
};

const applyResourceAvailability = (resources, bookings) =>
  resources.map((resource) => {
    const booked = bookings.some(
      (booking) =>
        booking.resourceId === resource.id &&
        ["Pending", "Approved"].includes(booking.status) &&
        isBookedOrUpcoming(booking.endTime)
    );
    return {
      ...resource,
      availability: booked ? "Booked" : "Available",
    };
  });

const parseResourceId = (value) => Number(value);

export const AppProvider = ({ children }) => {
  // ─── Auth State ───────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");

  // ─── Theme ────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(false);

  // ─── Resources ────────────────────────────────────────────
  const [resourceList, setResourceList] = useState([]);

  // ─── Bookings ─────────────────────────────────────────────
  const [bookingList, setBookingList] = useState([]);

  // ─── Users + Permissions ──────────────────────────────────
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // ─── UI State ─────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const apiRequest = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (!response.ok) {
      throw new Error(body.message || `Request failed: ${response.status}`);
    }

    return body;
  }, []);

  const loadUsers = useCallback(
    async () => {
      const data = await apiRequest("/users");
      const mapped = (data.users || []).map((u) => ({
        id: u.user_id,
        name: u.name,
        email: u.email,
        role: u.role_name,
        departmentId: u.department_id,
        department: u.department_name || `Department ${u.department_id}`,
        avatar: toAvatar(u.name),
      }));
      setUsers(mapped);

      setCurrentUser((prev) => {
        if (!prev) return prev;
        const latest = mapped.find((u) => u.id === prev.id);
        return latest ? { ...prev, ...latest } : prev;
      });
    },
    [apiRequest]
  );

  const loadBookings = useCallback(
    async () => {
      const data = await apiRequest("/bookings");
      const mapped = (data.bookings || []).map(mapBooking);
      setBookingList(mapped);
      return mapped;
    },
    [apiRequest]
  );

  const loadResources = useCallback(
    async (bookings = bookingList) => {
      const data = await apiRequest("/resources");
      const mapped = (data.resources || []).map((r) => {
        const departmentName = r.department_name || "General";
        const color = deptColorFromName(departmentName);
        return {
          id: r.resource_id,
          name: r.resource_name,
          type: r.type,
          location: r.location,
          departmentId: r.department_id,
          department: departmentName,
          capacity: "N/A",
          icon: TYPE_ICONS[r.type] || "📋",
          deptColor: color,
          availability: "Available",
        };
      });
      setResourceList(applyResourceAvailability(mapped, bookings));
    },
    [apiRequest, bookingList]
  );

  const loadPermissions = useCallback(
    async () => {
      const data = await apiRequest("/permissions");
      const mapped = (data.roles || []).map((r) => ({
        role: r.role_name,
        actions: r.permissions || [],
      }));
      setPermissions(mapped);
    },
    [apiRequest]
  );

  const refreshData = useCallback(async () => {
    const bookings = await loadBookings();
    await Promise.all([loadResources(bookings), loadUsers(), loadPermissions()]);
  }, [loadBookings, loadResources, loadUsers, loadPermissions]);

  // ─── Login Logic ─────────────────────────────────────────
  const login = useCallback(
    async (email, password, role) => {
      setLoading(true);
      try {
        const data = await apiRequest("/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        const user = data.user;
        if (role && user.role_name !== role) {
          setAuthError("Invalid credentials or role mismatch. Please try again.");
          setCurrentUser(null);
          return false;
        }

        setCurrentUser({
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          department: `Department ${user.department_id}`,
          avatar: toAvatar(user.name),
        });
        setAuthError("");

        await refreshData();
        return true;
      } catch (error) {
        setAuthError(error.message || "Login failed");
        setCurrentUser(null);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiRequest, refreshData]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthError("");
    setBookingList([]);
    setResourceList([]);
    setUsers([]);
    setPermissions([]);
    setSidebarOpen(true);
  }, []);

  // ─── Booking Actions ─────────────────────────────────────
  const createBooking = useCallback(
    async (resourceId, startTime, endTime) => {
      try {
        const data = await apiRequest("/booking", {
          method: "POST",
          body: JSON.stringify({
            user_id: currentUser?.id,
            resource_id: resourceId,
            start_time: startTime,
            end_time: endTime,
          }),
        });

        await refreshData();
        return { success: true, message: data.message || "Booking created successfully" };
      } catch (error) {
        return {
          success: false,
          message: error.message || "Unable to create booking",
        };
      }
    },
    [apiRequest, currentUser, refreshData]
  );

  // ─── Cancel Booking ──────────────────────────────────────
  const cancelBooking = useCallback(
    async (bookingId) => {
      const numericBookingId = parseBookingId(bookingId);
      if (Number.isNaN(numericBookingId)) {
        return { success: false, message: "Invalid booking id" };
      }

      try {
        await apiRequest(`/booking/${numericBookingId}`, { method: "DELETE" });
        await refreshData();
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message || "Unable to cancel booking" };
      }
    },
    [apiRequest, refreshData]
  );

  // ─── Admin: Approve / Reject ─────────────────────────────
  const updateBookingStatus = useCallback(
    async (bookingId, status) => {
      const numericBookingId = parseBookingId(bookingId);
      if (Number.isNaN(numericBookingId)) {
        return { success: false, message: "Invalid booking id" };
      }

      const path = status === "Approved"
        ? `/booking/approve/${numericBookingId}`
        : `/booking/reject/${numericBookingId}`;

      try {
        await apiRequest(path, { method: "PUT" });
        await refreshData();
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message || "Unable to update booking" };
      }
    },
    [apiRequest, refreshData]
  );

  // ─── Resource Management ─────────────────────────────────
  const addResource = useCallback(
    async (resource) => {
      try {
        const payload = {
          resource_name: resource.name,
          type: resource.type,
          location: resource.location,
          department_id: Number(resource.departmentId),
        };

        await apiRequest("/resources", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refreshData();
        return { success: true, message: "Resource added successfully" };
      } catch (error) {
        return {
          success: false,
          message: error.message || "Unable to add resource",
        };
      }
    },
    [apiRequest, refreshData]
  );

  const deleteResource = useCallback(
    async (resourceId) => {
      const numericId = parseResourceId(resourceId);
      if (Number.isNaN(numericId)) {
        return { success: false, message: "Invalid resource id" };
      }

      try {
        await apiRequest(`/resources/${numericId}`, { method: "DELETE" });
        await refreshData();
        return { success: true, message: "Resource deleted successfully" };
      } catch (error) {
        return {
          success: false,
          message: error.message || "Unable to delete resource",
        };
      }
    },
    [apiRequest, refreshData]
  );

  const toggleResourceAvailability = useCallback(async () => {
    await refreshData();
    return {
      success: false,
      message: "Availability is derived from bookings and cannot be toggled manually",
    };
  }, [refreshData]);

  // ─── Context Value ────────────────────────────────────────
  const value = {
    currentUser,
    authError,
    login,
    logout,
    darkMode,
    setDarkMode,
    resourceList,
    addResource,
    deleteResource,
    toggleResourceAvailability,
    bookingList,
    createBooking,
    cancelBooking,
    updateBookingStatus,
    sidebarOpen,
    setSidebarOpen,
    loading,
    setLoading,
    users,
    permissions,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for clean consumption
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
