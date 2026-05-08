import pool from "../db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
      u.user_id,
      u.name,
      u.email,
      u.role_id,
      r.role_name,
      u.department_id,
      d.department_name
     FROM users u
     LEFT JOIN \`role\` r ON r.role_id = u.role_id
     LEFT JOIN department d ON d.department_id = u.department_id
     ORDER BY u.user_id ASC`
  );

  return res.status(200).json({
    success: true,
    users: rows,
  });
});
