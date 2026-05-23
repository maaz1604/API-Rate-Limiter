import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { User } from "../models/user.model.js";
import { Usage } from "../models/usage.model.js";
import nodemailer from "nodemailer";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";

const sendDailyCSV = async () => {
    const date = new Date().toISOString().slice(0, 10);

    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({}, "name email plan apiKey");
    const usages = await Usage.find({ date });

    const data = users.map(user => {
        const usage = usages.find(u => u.apiKey === user.apiKey);
        return {
            name: user.name,
            email: user.email,
            plan: user.plan,
            requestsToday: usage?.count || 0,
            date
        };
    });

    const parser = new Parser();
    const csv = parser.parse(data);
    const filePath = path.join("reports", `usage-${date}.csv`);

    // Ensure reports folder exists
    fs.mkdirSync("reports", { recursive: true });
    fs.writeFileSync(filePath, csv);

    // Email setup
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: `"API System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Daily API Usage Report - ${date}`,
        text: "Attached is the CSV usage report for today.",
        attachments: [
            {
                filename: `usage-${date}.csv`,
                path: filePath
            }
        ]
    });

    console.log("Report sent:", info.response);
    mongoose.connection.close();
};

sendDailyCSV().catch(err => {
    console.error("Error sending report:", err.message);
    mongoose.connection.close();
});
