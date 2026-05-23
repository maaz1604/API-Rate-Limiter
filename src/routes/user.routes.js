import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { randomUUID, createHash } from "crypto";
import { authenticateToken } from "../middleware/auth.js";
import { signAuthToken } from "../utils/jwt.js";

const router = express.Router();

// Function to hash API key using SHA-256
function hashKey(key) {
    return createHash("sha256").update(key).digest("hex");
}

// create user with hashed API key
router.post("/users", async (req, res) => {
    try {
        const { name, email, password, plan } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }

        // 1. Generate raw API key
        const rawApiKey = randomUUID();

        // 2. Hash the API key before saving to DB
        const hashedApiKey = hashKey(rawApiKey);

        const passwordHash = await bcrypt.hash(password, 12);
        const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

        // 3. Save user with hashed API key
        const user = await User.create({
            name,
            email,
            plan,
            passwordHash,
            role,
            apiKey: hashedApiKey,
        });

        const token = signAuthToken(user);

        // 4. Return the raw key to user ONCE
        res.status(201).json({
            success: true,
            message: "User created. Please store your API key securely.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                role: user.role,
            },
            apiKey: rawApiKey,
            token,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/users/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/users/:id", authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        const isAdmin = req.auth.role === "admin";
        const isSelf = req.auth.userId === req.params.id;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ success: false, message: "You can only update your own profile" });
        }

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

        const updateFields = {};

        if (name !== undefined) {
            updateFields.name = name;
        }

        if (email !== undefined) {
            updateFields.email = email;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
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

export default router;
