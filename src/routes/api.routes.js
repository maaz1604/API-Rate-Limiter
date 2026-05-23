import express from "express";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/data", rateLimiter, (req, res) => {
    res.json({ message: "Access granted", user: req.user.name });
});

export default router;