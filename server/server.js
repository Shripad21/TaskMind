import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Import all routes
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/authRoutes.js";
import streakRoutes from "./routes/taskStreakRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

// Import middleware
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection failed:", err));

// Routes
app.use("/api/users", userRoutes);                          // ✅ Public routes (register, login)
app.use("/api/tasks", authenticateToken, taskRoutes);       // ✅ Protected task routes
app.use("/api/streaks", authenticateToken, streakRoutes);   // ✅ Protected streak routes
app.use("/api/daily-summary", authenticateToken, summaryRoutes); // ✅ Protected summary routes

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ 
        message: "TaskMind server is running!", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
        
        
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(500).json({ error: "Internal server error" });
});

// 404 handler for unmatched routes
app.use("/*path", (req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TaskMind server listening on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(authenticateToken);
});
