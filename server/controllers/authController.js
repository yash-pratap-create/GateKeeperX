import pool from "../db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const [rows] = await pool.execute(
    `SELECT
      u.user_id,
      u.name,
      u.email,
      u.role_id,
      r.role_name,
      u.department_id
     FROM users u
     LEFT JOIN \`role\` r ON r.role_id = u.role_id
     WHERE u.email = ? AND u.password = ?
     LIMIT 1`,
    [email, password]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  return res.status(200).json({
    success: true,
    user: rows[0],
  });
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, departmentId } = req.body;

  if (!name || !email || !password || !role || !departmentId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Prevent self-registration as Admin
  if (role === "Admin") {
    return res.status(403).json({ success: false, message: "Admin accounts cannot be self-registered" });
  }

  // Map role name → role_id
  const [roleRows] = await pool.execute(
    "SELECT role_id FROM `role` WHERE role_name = ? LIMIT 1",
    [role]
  );
  if (roleRows.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid role selected" });
  }
  const role_id = roleRows[0].role_id;

  // Check duplicate email
  const [existing] = await pool.execute(
    "SELECT user_id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  // Insert new user
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password, role_id, department_id) VALUES (?, ?, ?, ?, ?)",
    [name.trim(), email.trim().toLowerCase(), password, role_id, departmentId]
  );

  // Return the new user (same shape as login)
  const [newUser] = await pool.execute(
    `SELECT u.user_id, u.name, u.email, u.role_id, r.role_name, u.department_id
     FROM users u
     LEFT JOIN \`role\` r ON r.role_id = u.role_id
     WHERE u.user_id = ? LIMIT 1`,
    [result.insertId]
  );

  return res.status(201).json({ success: true, user: newUser[0] });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT department_id, department_name FROM department ORDER BY department_name"
  );
  return res.status(200).json({ success: true, departments: rows });
});
