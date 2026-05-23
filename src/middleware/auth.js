import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: "Access token required" });
    }

    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "JWT_SECRET is not configured" });
        }

        req.auth = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.auth) {
            return res.status(401).json({ success: false, message: "Access token required" });
        }

        if (!allowedRoles.includes(req.auth.role)) {
            return res.status(403).json({ success: false, message: "Insufficient permissions" });
        }

        next();
    };
};