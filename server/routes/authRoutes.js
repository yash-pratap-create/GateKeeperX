import { Router } from "express";
import { login, signup, getDepartments } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/departments", getDepartments);

export default router;
