import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
    apiKey: String,
    date: {
        type: String,
        default: () => new Date().toISOString().slice(0, 10)
    },
    count: {
        type: Number,
        default: 0
    },
    warningSent: {
        type: Boolean,
        default: false
    },
    limitReachedEmailSent: {
        type: Boolean,
        default: false,
    }
});

export const Usage = mongoose.model("Usage", usageSchema);