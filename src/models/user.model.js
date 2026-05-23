import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    plan: {
        type: String,
        enum: ["basic", "pro", "premium"],
        default: "basic",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    apiKey: {
        type: String,
        unique: true
    }
});

export const User = mongoose.model("User", userSchema);