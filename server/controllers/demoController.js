import pool from "../db.js";
import asyncHandler from "../utils/asyncHandler.js";

// Fixed list of demo account emails — new signups will never appear here
const DEMO_EMAILS = [
  "admin@college.edu",
  "rahul@college.edu",
  "karan@college.edu",
  "anita@college.edu",
  "priya@college.edu",
];

export const getDemoCredentials = asyncHandler(async (req, res) => {
  const placeholders = DEMO_EMAILS.map(() => "?").join(", ");
  const [rows] = await pool.execute(
    `SELECT u.name, u.email, u.password, r.role_name
     FROM users u
     INNER JOIN \`role\` r ON r.role_id = u.role_id
     WHERE u.email IN (${placeholders})
     ORDER BY FIELD(r.role_name, 'Admin', 'Faculty', 'Student', 'Lab Assistant')`,
    DEMO_EMAILS
  );

  return res.status(200).json({
    success: true,
    demoCredentials: rows.map((row) => ({
      role: row.role_name,
      email: row.email,
      password: row.password,
      name: row.name,
    })),
  });
});