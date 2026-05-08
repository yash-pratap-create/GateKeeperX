// ============================================================
// Hero.jsx — Full-width campus hero section for Dashboard
// Background: Unsplash campus photo + dark gradient overlay
// Sections: Brand, Title, CTA buttons, Features strip
// ============================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faRocket,
  faCalendarPlus,
  faBuilding,
  faLock,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";

const HERO_FEATURES = [
  { icon: "🏢", label: "Manage Resources",       desc: "Labs, halls & equipment" },
  { icon: "📅", label: "Easy Booking System",     desc: "Real-time availability" },
  { icon: "🔐", label: "Secure Access Control",   desc: "Role-based permissions" },
  { icon: "🏫", label: "Campus-Wide Coverage",    desc: "All departments unified" },
];

const Hero = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => navigate("/book");
  const handleBookResource = () => navigate("/resources");

  return (
    <div className="hero-section">
      {/* ── Gradient overlay ── */}
      <div className="hero-overlay" />

      {/* ── Floating glow orbs ── */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      {/* ── Content ── */}
      <div className="hero-content">
        {/* Brand badge */}
        <div className="hero-badge">
          <FontAwesomeIcon icon={faShield} />
          <span>Smart Campus Platform</span>
        </div>

        {/* Main title */}
        <h1 className="hero-title">
          Gate<span>Keeper</span>X
        </h1>

        {/* Tagline */}
        <p className="hero-tagline">
          Smart Access. Seamless Control.
        </p>

        {/* Description */}
        <p className="hero-desc">
          A modern platform to manage college resources, bookings, and access
          efficiently. Centralized control for academic infrastructure across
          all departments.
        </p>

        {/* CTA Buttons */}
        <div className="hero-actions">
          <button
            className="hero-btn hero-btn-primary"
            onClick={handleGetStarted}
            id="hero-get-started"
          >
            <FontAwesomeIcon icon={faRocket} />
            Get Started
          </button>
          <button
            className="hero-btn hero-btn-secondary"
            onClick={handleBookResource}
            id="hero-book-resource"
          >
            <FontAwesomeIcon icon={faCalendarPlus} />
            Book Resource
          </button>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint">
          <FontAwesomeIcon icon={faArrowDown} />
          <span>View Dashboard</span>
        </div>
      </div>

      {/* ── Features strip ── */}
      <div className="hero-features-strip">
        {HERO_FEATURES.map((f, i) => (
          <div key={i} className="hero-feature-item">
            <span className="hero-feature-icon">{f.icon}</span>
            <div className="hero-feature-text">
              <strong>{f.label}</strong>
              <small>{f.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
