import express from "express";
import { User } from "../models/user.model.js";
import { randomUUID, createHash } from "crypto";

const router = express.Router();

// Function to hash API key using SHA-256
function hashKey(key) {
    return createHash("sha256").update(key).digest("hex");
}

// create user with hashed API key
router.post("/users", async (req, res) => {
    try {
        const { name, email, plan } = req.body;

        // 1. Generate raw API key
        const rawApiKey = randomUUID();

        // 2. Hash the API key before saving to DB
        const hashedApiKey = hashKey(rawApiKey);

        // 3. Save user with hashed API key
        const user = await User.create({
            name,
            email,
            plan,
            apiKey: hashedApiKey,
        });

        // 4. Return the raw key to user ONCE
        res.status(201).json({
            success: true,
            message: "User created. Please store your API key securely.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
            },
            apiKey: rawApiKey,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    };

    router.put("/users/:id", async (req, res) => {
        try {
            const { name, email } = req.body;

            if (!name && !email) {
                return res.status(400).json({ message: "Nothing to update" });
            }

            // If email is being updated, check if it's already used
            if (email) {
                const existing = await User.findOne({ email });
                if (existing && existing._id.toString() !== req.params.id) {
                    return res.status(409).json({ message: "Email already in use" });
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { $set: { name, email } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ success: true, user: updatedUser });

        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });
});

export default router;
