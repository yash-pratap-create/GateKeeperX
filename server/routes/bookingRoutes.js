import { Router } from "express";
import {
  createBooking,
  getBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
} from "../controllers/bookingController.js";

const router = Router();

router.post("/booking", createBooking);
router.get("/bookings", getBookings);
router.delete("/booking/:id", cancelBooking);
router.put("/booking/approve/:id", approveBooking);
router.put("/booking/reject/:id", rejectBooking);

export default router;
