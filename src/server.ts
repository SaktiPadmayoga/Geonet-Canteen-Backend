import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/database";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import productRoute from "./routes/productRoute";
import uploadRoutes from "./routes/uploadRoutes";
import transactionRoute from "./routes/transactionRoute";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
// app.use(helmet());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoute);
app.use("/api/upload", uploadRoutes);
app.use("/api/transactions", transactionRoute);

app.get("/", (req, res) => {
    const response = res.json({ message: "API is running!" });
    console.log(response);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
