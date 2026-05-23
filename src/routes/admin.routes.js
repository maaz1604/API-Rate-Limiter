import express from "express";
import { User } from "../models/user.model.js";
import { Usage } from "../models/usage.model.js";
import { randomUUID, createHash } from "crypto";
import { Parser } from "json2csv";

const router = express.Router();

// Utility: Hash API key
function hashKey(key) {
    return createHash("sha256").update(key).digest("hex");
}

// Regenerate API key securely
router.put("/admin/users/:id/apikey", async (req, res) => {
    try {
        const rawKey = randomUUID();
        const hashedKey = hashKey(rawKey);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { apiKey: hashedKey },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "API key regenerated successfully. This key will not be shown again.",
            apiKey: rawKey
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dashboard with pagination and date filter
router.get("/admin/dashboard", async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().slice(0, 10);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const users = await User.find({}, "_id name email plan apiKey")
            .skip((page - 1) * limit)
            .limit(limit);

        const totalUsers = await User.countDocuments();
        const usages = await Usage.find({ date });

        const data = users.map(user => {
            const usage = usages.find(u => u.apiKey === user.apiKey);
            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                requestsToday: usage?.count || 0,
                date: date
            };
        });

        res.json({
            success: true,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CSV export of dashboard
router.get("/admin/dashboard/csv", async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().slice(0, 10);

        const users = await User.find({}, "_id name email plan apiKey");
        const usages = await Usage.find({ date });

        const data = users.map(user => {
            const usage = usages.find(u => u.apiKey === user.apiKey);
            return {
                name: user.name,
                email: user.email,
                plan: user.plan,
                requestsToday: usage?.count || 0,
                date: date
            };
        });

        const parser = new Parser();
        const csv = parser.parse(data);

        res.header("Content-Type", "text/csv");
        res.attachment(`usage-${date}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
