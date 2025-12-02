import mongoose from 'mongoose';
import { application } from './application.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(application.MONGO_URL);
    console.log("Connected to MongoDB:", application.MONGO_URL);
    console.log("Available collections will be: autousers, products");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;