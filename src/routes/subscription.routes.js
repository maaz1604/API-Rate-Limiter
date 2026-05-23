// src/routes/subscription.routes.js
import express from "express";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Create subscription and update user
router.post("/subscriptions", authenticateToken, async (req, res) => {
    try {
        const { userId, plan } = req.body;

        if (req.auth.role !== "admin" && req.auth.userId !== userId) {
            return res.status(403).json({ success: false, message: "You can only manage your own subscription" });
        }

        const subscription = await Subscription.create({
            userId,
            plan,
            status: "active",
        });

        await User.findByIdAndUpdate(userId, { plan });

        res.status(201).json({
            success: true,
            message: "Subscription created and user updated",
            subscription,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
