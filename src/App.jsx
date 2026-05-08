// ============================================================
// App.js — Root component, routing, layout, auth guards
// ============================================================

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { AppProvider, useApp } from "./context/AppContext";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookResource from "./pages/BookResource";
import MyBookings from "./pages/MyBookings";
import Resources from "./pages/Resources";
import AdminPanel from "./pages/AdminPanel";
import Permissions from "./pages/Permissions";

// Global styles
import "./styles.css";

// ─── Protected Route Wrapper ──────────────────────────────────
const ProtectedLayout = () => {
  const { currentUser, sidebarOpen, setSidebarOpen, darkMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect unauthenticated users
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    // On mobile: toggle mobile panel; on desktop: collapse/expand
    if (window.innerWidth <= 768) {
      setMobileOpen((m) => !m);
    } else {
      setSidebarOpen((s) => !s);
    }
  };

  return (
    <div className="app-layout" data-theme={darkMode ? "dark" : "light"}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={`main-wrapper ${!sidebarOpen ? "sidebar-collapsed" : ""}`}
      >
        <Navbar onMenuClick={toggleSidebar} />
        <main>
          <Outlet />
        </main>
        {/* Persistent footer on every protected page */}
        <Footer />
      </div>
    </div>
  );
};

// ─── Admin-Only Guard ─────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { currentUser } = useApp();
  if (currentUser?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ─── App with Providers ───────────────────────────────────────
const App = () => {
  return (
    <AppProvider>
      <AppWrapper />
    </AppProvider>
  );
};

// Inner wrapper to access context for theme
const AppWrapper = () => {
  const { darkMode } = useApp();

  // Apply theme to <html> element globally
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  return (
    <BrowserRouter>
      {/* Global Toast Notifications — works across all pages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        style={{ zIndex: 10000 }}
      />

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<BookResource />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/resources" element={<Resources />} />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <AdminRoute>
                <Permissions />
              </AdminRoute>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
