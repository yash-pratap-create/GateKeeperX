import pool from "../db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getPermissions = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
      r.role_id,
      r.role_name,
      p.permission_name
     FROM \`role\` r
     LEFT JOIN permission p ON p.role_id = r.role_id
     ORDER BY r.role_id ASC, p.permission_name ASC`
  );

  const mapping = [];

  for (const row of rows) {
    let roleEntry = mapping.find((item) => item.role_id === row.role_id);

    if (!roleEntry) {
      roleEntry = {
        role_id: row.role_id,
        role_name: row.role_name,
        permissions: [],
      };
      mapping.push(roleEntry);
    }

    if (row.permission_name) {
      roleEntry.permissions.push(row.permission_name);
    }
  }

  return res.status(200).json({
    success: true,
    roles: mapping,
  });
});
