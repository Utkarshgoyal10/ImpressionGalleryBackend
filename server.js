import dotenv from "dotenv";
import express from "express";
import cors from "cors"; // import cors
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import cardRoutes from "./routes/cardRoutes.js";
import "./cron/birthdayAnniversary.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors()); // enable CORS for all routes
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", userRoutes);
app.use("/api/customer", cardRoutes);
app.use("/api/analytics", analyticsRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
