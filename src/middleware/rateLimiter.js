import { Usage } from "../models/usage.model.js";
import { User } from "../models/user.model.js";
import { createHash } from "crypto";
import { sendUsageWarning, sendLimitReachedEmail } from "../utils/email.js";

// Hash API key function
function hashKey(key) {
    return createHash("sha256").update(key).digest("hex");
}

const PLAN_LIMITS = {
    basic: 100,
    pro: 1000,
    premium: 10000,
};

export const rateLimiter = async (req, res, next) => {
    const rawKey = req.headers["x-api-key"];
    if (!rawKey) return res.status(401).json({ message: "API key required" });

    const apiKey = hashKey(rawKey);
    const user = await User.findOne({ apiKey });
    if (!user) return res.status(403).json({ message: "Invalid API key" });

    const date = new Date().toISOString().slice(0, 10);
    const limit = PLAN_LIMITS[user.plan];

    let usage = await Usage.findOne({ apiKey, date });

    if (!usage) {
        usage = await Usage.create({ apiKey, count: 1 });
    } else {
        if (usage.count >= limit) {
            if (!usage.limitReachedEmailSent) {
                try {
                    await sendLimitReachedEmail(user, usage.count, limit);
                    usage.limitReachedEmailSent = true;
                } catch (err) {
                    console.error("Failed to send 100% limit email:", err.message);
                }
            }

            await usage.save();
            return res.status(429).json({ message: "Rate limit exceeded" });
        }

        usage.count += 1;

        if (!usage.warningSent && usage.count >= Math.floor(0.9 * limit)) {
            try {
                await sendUsageWarning(user, usage.count, limit);
                usage.warningSent = true;
            } catch (err) {
                console.error("Failed to send 90% warning email:", err.message);
            }
        }

        await usage.save();
    }

    req.user = user;
    next();
};
