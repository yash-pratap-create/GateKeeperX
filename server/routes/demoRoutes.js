import { Router } from "express";
import { getDemoCredentials } from "../controllers/demoController.js";

const router = Router();

router.get("/demo-credentials", getDemoCredentials);

export default router;