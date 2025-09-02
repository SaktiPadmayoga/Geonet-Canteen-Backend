import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/geonet-pantry");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "API is running!" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
