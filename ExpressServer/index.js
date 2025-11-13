import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from "./route/auth.routes.js";
import productRoutes from "./route/product.routes.js";
import usersRouter from "./route/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", usersRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`Register endpoint: http://localhost:${PORT}/api/auth/register`);
});