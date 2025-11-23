import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
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
  internalId: Number,
  image: String
}, { timestamps: true });

export default mongoose.model("products", productSchema);