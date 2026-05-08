// ============================================================
// Permissions.js — Role-based access control overview
// Displays permissions matrix as cards and a full table
// ============================================================

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faChalkboardTeacher,
  faUserGraduate,
  faFlask,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";
import PageLayout from "../components/PageLayout";

const ROLE_ICONS = {
  Admin: faUserShield,
  Faculty: faChalkboardTeacher,
  Student: faUserGraduate,
  "Lab Assistant": faFlask,
};

const ROLE_COLORS = {
  Admin: "#7c3aed",
  Faculty: "#2563eb",
  Student: "#16a34a",
  "Lab Assistant": "#f59e0b",
};

const Permissions = () => {
  const { permissions } = useApp();

  const mappedPermissions = permissions.map((perm) => ({
    ...perm,
    color: ROLE_COLORS[perm.role] || "#64748b",
    icon: ROLE_ICONS[perm.role] ? "🛡️" : "💼",
  }));

  const allActions = Array.from(
    new Set(mappedPermissions.flatMap((perm) => perm.actions || []))
  );

  return (
    <PageLayout variant="default">
      <div className="page-header">
        <h2>🔐 Role-Based Academic Access Control</h2>
        <p>
          Centralized control for academic infrastructure — each role has specific access permissions
          aligned with institutional policy.
        </p>
      </div>

      {mappedPermissions.length === 0 && (
        <div className="empty-state" style={{ marginBottom: 28 }}>
          <div className="empty-icon">🔐</div>
          <h3>No permissions configured</h3>
          <p>Add rows in the permission table to see role mapping here.</p>
        </div>
      )}

      {/* Permission Cards */}
      <div className="permissions-grid" style={{ marginBottom: 36 }}>
        {mappedPermissions.map((perm) => (
          <div key={perm.role} className="permission-card">
            <div
              className="permission-card-header"
              style={{
                borderBottom: "1px solid var(--border)",
                marginBottom: 0,
              }}
            >
              <div
                className="role-avatar"
                style={{ background: perm.color }}
              >
                <span style={{ fontSize: 18 }}>{perm.icon || "💼"}</span>
              </div>
              <div>
                <h3>{perm.role}</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{perm.actions.length} permissions</p>
              </div>
            </div>
            {/* Role description */}
            {perm.description && (
              <p style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                padding: "10px 16px 0",
                fontStyle: "italic",
              }}>
                {perm.description}
              </p>
            )}
            <div className="permission-actions" style={{ paddingTop: 12 }}>
              {perm.actions.map((action) => (
                <div key={action} className="permission-action">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{
                      color: perm.color,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Full Matrix Table */}
      <div className="card">
        <div className="card-header">
          <h3>📊 Academic Permission Matrix</h3>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Institutional access policy</span>
        </div>
        <div className="table-container" style={{ border: "none", boxShadow: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Permission / Action</th>
                {mappedPermissions.map((p) => (
                  <th key={p.role} style={{ textAlign: "center" }}>
                    <span
                      className="badge"
                      style={{
                        background: p.color + "20",
                        color: p.color,
                      }}
                    >
                      {p.role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allActions.map((action) => (
                <tr key={action}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{action}</td>
                  {mappedPermissions.map((perm) => {
                    const hasPermission = perm.actions.includes(action);
                    return (
                      <td key={perm.role} style={{ textAlign: "center" }}>
                        {hasPermission ? (
                          <span
                            style={{
                              fontSize: 16,
                              color: perm.color,
                            }}
                          >
                            ✓
                          </span>
                        ) : (
                          <span style={{ color: "var(--border)", fontSize: 14 }}>
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 20,
          padding: "16px 20px",
          background: "var(--brand-50)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--brand-100)",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--brand-700)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            alignSelf: "center",
          }}
        >
          🔑 Access Level:
        </p>
        {mappedPermissions.map((p) => (
          <div
            key={p.role}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: p.color,
              }}
            />
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {p.role}
            </span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Permissions;
