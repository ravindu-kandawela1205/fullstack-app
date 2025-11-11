import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from "./route/auth.routes.js";
import cors from 'cors';
import usersRouter from "./route/users.js";
const app=express();
dotenv.config();

const PORT=process.env.PORT || 8000;
const MONGO_URL=process.env.MONGO_URL;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", usersRouter);

// routes
app.use("/api/auth", authRoutes);

// health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

mongoose.connect(MONGO_URL).then(()=>{
    console.log("Connected to MongoDB:", MONGO_URL);
    console.log("Available collections will be: autousers, products");
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
        console.log(`Register endpoint: http://localhost:${PORT}/api/auth/register`);
    });
}).catch((err)=>{
    console.error("MongoDB connection error:", err);
})

const productSchema=new mongoose.Schema({
    index: Number,
  name: String,
  description: String,
  brand: String,
  category: String,
  price: Number,
  currency: String,
  stock: Number,
  ean: Number,
  color: String,
  size: String,
  availability: String,
  internalId: Number
   
});

const productModel=mongoose.model("products",productSchema);

app.get("/api/products",async(req,res)=>{
    try {
        const productData = await productModel.find();
        console.log(`Found ${productData.length} products`);
        res.json(productData);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
})