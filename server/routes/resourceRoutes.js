import { Router } from "express";
import {
	getResources,
	createResource,
	updateResource,
	deleteResource,
} from "../controllers/resourceController.js";

const router = Router();

router.get("/resources", getResources);
router.post("/resources", createResource);
router.put("/resources/:id", updateResource);
router.delete("/resources/:id", deleteResource);

export default router;
