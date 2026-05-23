// src/routes/subscription.routes.js
import express from "express";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Create subscription and update user
router.post("/subscriptions", async (req, res) => {
    try {
        const { userId, plan } = req.body;

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
