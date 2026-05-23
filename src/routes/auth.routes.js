import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { signAuthToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password, plan } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

        const user = await User.create({
            name,
            email,
            passwordHash,
            plan,
            role,
        });

        const token = signAuthToken(user);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
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

router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password are required" });
        }

        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = signAuthToken(user);

        res.json({
            success: true,
            message: "Login successful",
            token,
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

export default router;