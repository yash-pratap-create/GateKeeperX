import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GateKeeperX backend is running",
  });
});

app.use(authRoutes);
app.use(resourceRoutes);
app.use(bookingRoutes);
app.use(permissionRoutes);
app.use(userRoutes);
app.use(demoRoutes);

app.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ success: true, message: "Server is healthy" });
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
