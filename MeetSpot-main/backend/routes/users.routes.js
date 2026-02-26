import { Router } from "express";
import { addToHistory, getUserHistory, login, register, getProfile, forgotPassword, resetPassword } from "../controllers/user.controller.js";

const router = Router();

// Simple LinkedIn URL validation middleware (optional field)
const validateLinkedIn = (req, res, next) => {
    const { linkedin } = req.body || {};
    if (!linkedin || typeof linkedin !== 'string' || linkedin.trim() === "") return next();
    const v = linkedin.trim();
    const allowed = [
        "linkedin.com/in/",
        "www.linkedin.com/in/",
        "https://linkedin.com/in/",
        "https://www.linkedin.com/in/",
    ];
    const ok = allowed.some(p => v.startsWith(p) && v.length > p.length);
    if (!ok) {
        return res.status(400).json({ message: "Please enter a valid LinkedIn profile URL or else leave blank its optional" });
    }
    return next();
};

router.route("/login").post(login)
router.route("/register").post(validateLinkedIn, register)
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)
router.route("/profile/:username").get(getProfile)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password").post(resetPassword)

export default router;
