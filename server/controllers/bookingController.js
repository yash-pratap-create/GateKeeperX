import pool from "../db.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createBooking = asyncHandler(async (req, res) => {
  const { user_id, resource_id, start_time, end_time } = req.body;

  if (!user_id || !resource_id || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "user_id, resource_id, start_time, and end_time are required",
    });
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking time range",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [overlaps] = await connection.execute(
      `SELECT booking_id
       FROM booking
       WHERE resource_id = ?
         AND status IN ('Pending', 'Approved')
         AND NOT (end_time <= ? OR start_time >= ?)
       FOR UPDATE`,
      [resource_id, start_time, end_time]
    );

    if (overlaps.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Resource is already booked for the selected time slot",
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO booking (user_id, resource_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [user_id, resource_id, start_time, end_time]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking_id: result.insertId,
      status: "Pending",
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const getBookings = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
      b.booking_id,
      b.user_id,
      u.name AS user_name,
      u.email AS user_email,
      b.resource_id,
      r.resource_name,
      r.type AS resource_type,
      b.start_time,
      b.end_time,
      b.status
     FROM booking b
     INNER JOIN users u ON u.user_id = b.user_id
     INNER JOIN resource r ON r.resource_id = b.resource_id
     ORDER BY b.start_time DESC`
  );

  return res.status(200).json({
    success: true,
    bookings: rows,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking id",
    });
  }

  const [result] = await pool.execute(
    "UPDATE booking SET status = 'Cancelled' WHERE booking_id = ?",
    [bookingId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
  });
});

const updateBookingStatus = async (bookingId, status) => {
  const [result] = await pool.execute(
    "UPDATE booking SET status = ? WHERE booking_id = ?",
    [status, bookingId]
  );

  return result.affectedRows;
};

export const approveBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking id",
    });
  }

  const affectedRows = await updateBookingStatus(bookingId, "Approved");

  if (affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Booking approved",
  });
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking id",
    });
  }

  const affectedRows = await updateBookingStatus(bookingId, "Cancelled");

  if (affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Booking rejected",
  });
});
