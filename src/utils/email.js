import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 90% usage warning
export const sendUsageWarning = async (user, used, limit) => {
    const percentUsed = ((used / limit) * 100).toFixed(2);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "API Usage Warning",
        text: `Hi ${user.name},\n\nYou have used ${used}/${limit} (${percentUsed}%) of your daily API limit.\n\nPlease upgrade if needed.\n\n- API Rate Limiter`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("90% warning email sent:", info.response);
};

// 100% limit reached
export const sendLimitReachedEmail = async (user, used, limit) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "API Limit Reached",
        text: `Hi ${user.name},\n\nYou have reached your daily API limit (${used}/${limit}). Your API access has been blocked until the next reset.\n\n- API Rate Limiter`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("100% limit reached email sent:", info.response);
};
