import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    plan: {
        type: String,
        required: true,
        enum: ["basic", "pro", "premium"],
    },
    status: {
        type: String,
        enum: ["active", "cancelled"],
        default: "active",
    },
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
