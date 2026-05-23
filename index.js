import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Usage } from "./src/models/usage.model.js";
import { exec } from "child_process";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected for scheduled tasks");
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
    });

// Reset usage at midnight daily
cron.schedule("0 0 * * *", async () => {
    try {
        console.log("Resetting usage...");
        await Usage.deleteMany({});
        console.log("Usage reset complete");
    } catch (error) {
        console.error("Failed to reset usage:", error.message);
    }
});

// Send usage report at 8 AM daily
cron.schedule("0 8 * * *", () => {
    console.log("Sending daily CSV report...");
    exec("node scripts/sendCsvReport.js", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error sending CSV report: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Report sent:\n${stdout}`);
    });
});
