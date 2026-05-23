import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    plan: {
        type: String,
        enum: ["basic", "pro", "premium"],
        default: "basic",
    },
    apiKey: {
        type: String,
        unique: true
    }
});

export const User = mongoose.model("User", userSchema);