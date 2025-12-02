import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from "./route/auth.routes.js";
import productRoutes from "./route/product.routes.js";
import usersRouter from "./route/users.js";
import uploadRoutes from "./route/upload.routes.js";
import { application } from './config/application.js';

const app = express();
const PORT = application.PORT;

// Middleware
app.use(cors({
  origin: application.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", usersRouter);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Login endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log(`Register endpoint: http://localhost:${PORT}/api/auth/register`);
    console.log(`Email config: ${application.EMAIL_HOST}:${application.EMAIL_PORT}`);
  });
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}