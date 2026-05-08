import pool from "../db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getResources = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
      r.resource_id,
      r.resource_name,
      r.type,
      r.location,
      r.department_id,
      d.department_name
     FROM resource r
     LEFT JOIN department d ON d.department_id = r.department_id
     ORDER BY r.resource_id DESC`
  );

  return res.status(200).json({
    success: true,
    resources: rows,
  });
});

export const createResource = asyncHandler(async (req, res) => {
  const { resource_name, type, location, department_id } = req.body;

  if (!resource_name || !type || !location || !department_id) {
    return res.status(400).json({
      success: false,
      message: "resource_name, type, location, and department_id are required",
    });
  }

  const [result] = await pool.execute(
    `INSERT INTO resource (resource_name, type, location, department_id)
     VALUES (?, ?, ?, ?)`,
    [resource_name, type, location, Number(department_id)]
  );

  return res.status(201).json({
    success: true,
    message: "Resource created successfully",
    resource_id: result.insertId,
  });
});

export const updateResource = asyncHandler(async (req, res) => {
  const resourceId = Number(req.params.id);
  const { resource_name, type, location, department_id } = req.body;

  if (Number.isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
    });
  }

  if (!resource_name || !type || !location || !department_id) {
    return res.status(400).json({
      success: false,
      message: "resource_name, type, location, and department_id are required",
    });
  }

  const [result] = await pool.execute(
    `UPDATE resource
     SET resource_name = ?, type = ?, location = ?, department_id = ?
     WHERE resource_id = ?`,
    [resource_name, type, location, Number(department_id), resourceId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Resource updated successfully",
  });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const resourceId = Number(req.params.id);

  if (Number.isNaN(resourceId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
    });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM resource WHERE resource_id = ?",
      [resourceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    if (error && error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete resource because bookings are linked to it",
      });
    }
    throw error;
  }
});
