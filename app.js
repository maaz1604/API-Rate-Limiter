import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import apiRoutes from "./src/routes/api.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import subscriptionRoutes from "./src/routes/subscription.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use("/api", apiRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", subscriptionRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
    })
    .catch(err => console.error("DB Error", err));