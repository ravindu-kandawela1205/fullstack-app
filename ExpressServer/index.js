import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import usersRouter from "./route/users.js";
const app=express();
dotenv.config();

const PORT=process.env.PORT || 7000;
const MONGO_URL=process.env.MONGO_URL;

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);

mongoose.connect(MONGO_URL).then(()=>{
    console.log("Connected to MongoDB");
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err)=>{
    console.log(err);
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