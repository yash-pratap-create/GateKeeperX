// ============================================================
// PageLayout.jsx — Per-page background variant system
//
// Variants:
//   "auth"      → Login page (handled directly in Login.jsx)
//   "dashboard" → Clean gray + subtle radial top, no blobs
//   "default"   → Pure white, minimal, content-focused
//
// Usage: <PageLayout variant="dashboard"> ... </PageLayout>
// Replaces the raw <div className="page-content"> on every page.
// All padding, flex, and animations from .page-content are kept.
// The variant class only overrides the background.
// ============================================================

import React from "react";

const PageLayout = ({ children, variant = "default", style = {} }) => (
  <div
    className={`page-content page-layout--${variant}`}
    style={style}
  >
    {children}
  </div>
);

export default PageLayout;
