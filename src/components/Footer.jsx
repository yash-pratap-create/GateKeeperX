// ============================================================
// Footer.jsx — App-wide footer with GateKeeperX branding
// Tagline: "Smart Access. Seamless Control."
// ============================================================

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faHeart } from "@fortawesome/free-solid-svg-icons";

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-inner">
      {/* Brand */}
      <div className="footer-brand">
        <div className="footer-logo">
          <FontAwesomeIcon icon={faShield} />
        </div>
        <div>
          <span className="footer-name">
            Gate<span>Keeper</span>X
          </span>
          <p className="footer-tagline">"Smart Access. Seamless Control."</p>
        </div>
      </div>

      {/* Copyright */}
      <p className="footer-copy">
        © 2026 GateKeeperX. Made with{" "}
        <FontAwesomeIcon icon={faHeart} style={{ color: "var(--danger)", fontSize: 11 }} />{" "}
        for colleges everywhere.
      </p>
    </div>
  </footer>
);

export default Footer;
