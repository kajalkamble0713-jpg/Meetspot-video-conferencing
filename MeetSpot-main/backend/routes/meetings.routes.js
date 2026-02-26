import { Router } from "express";
import { createMeeting, joinMeeting } from "../controllers/meetings.controller.js";

const router = Router();

router.post("/create", createMeeting);
router.post("/join", joinMeeting);

export default router;