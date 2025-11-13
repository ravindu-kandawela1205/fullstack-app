# MongoDB Connection & Data Operations Guide

## How MongoDB Connects to Express Server

### MongoDB Connection Flow
```
MongoDB Database ↔ Express Server ↔ Frontend (React)
```

## Step-by-Step MongoDB Implementation

### STEP 1: MongoDB Connection Setup

#### Database Connection Configuration
**File:** `ExpressServer/config/db.js`
```js
import mongoose from 'mongoose';

// CONNECT TO MONGODB - Single connection for entire app
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URL);
    console.log("📊 Database name:", conn.connection.db.databaseName);
    console.log("🔗 Connection ready state:", conn.connection.readyState); // 1 = connected
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stop server if database fails
  }
};

export default connectDB;
```
**What this does:**
- Creates single database connection for entire application
- Uses environment variable for database URL
- Shows connection status and database name
- Stops server if connection fails

#### Start Connection in Main Server
**File:** `ExpressServer/index.js`
```js
import connectDB from './config/db.js';

// Connect to database when server starts
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```
**What this does:**
- Connects to MongoDB when server starts
- All routes can now use database operations

#### Environment Variables
**File:** `ExpressServer/.env`
```
MONGO_URL=mongodb://localhost:27017/dbconnect
```
**What this means:**
- `mongodb://` - MongoDB protocol
- `localhost:27017` - MongoDB server address and port
- `dbconnect` - Database name

### STEP 2: Data Models (Database Structure)

#### User Model Example
**File:** `ExpressServer/models/authuser.js`
```js
import mongoose from "mongoose";

// DEFINE DATA STRUCTURE - What user data looks like
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,           // Must have name
    minlength: 2,            // At least 2 characters
    maxlength: 60            // Max 60 characters
  },
  email: { 
    type: String, 
    unique: true,            // No duplicate emails
    required: true,          // Must have email
    lowercase: true,         // Convert to lowercase
    index: true              // Create index for faster searches
  },
  passwordHash: { 
    type: String, 
    required: true           // Must have password
  },
}, { 
  timestamps: true           // Auto-add createdAt and updatedAt
});

// CREATE MODEL - Connect schema to "authusers" collection
export const User = mongoose.model("authusers", userSchema);
```
**What this does:**
- Defines structure of user data in MongoDB
- Sets validation rules (required, unique, length)
- Creates "authusers" collection in database
- Adds automatic timestamps

#### Product Model Example
**File:** `ExpressServer/models/product.js`
```js
import mongoose from "mongoose";

// PRODUCT DATA STRUCTURE
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, default: 0, min: 0 },
  description: { type: String },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

// CREATE PRODUCTS COLLECTION
export default mongoose.model("products", productSchema);
```

### STEP 3: Database Operations (CRUD)

#### CREATE - Add New Data
**File:** `ExpressServer/controllers/product.controller.js`
```js
import Product from "../models/product.js";

// ADD NEW PRODUCT TO DATABASE
export const createProduct = async (req, res) => {
  try {
    console.log("📝 Creating product with data:", req.body);
    
    // Save new product to MongoDB
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      description: req.body.description
    });
    
    console.log("✅ Product created in database:", product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(400).json({ message: error.message });
  }
};
```
**What happens:**
1. Receives product data from frontend
2. `Product.create()` saves data to MongoDB "products" collection
3. MongoDB assigns unique `_id` to new product
4. Returns created product with database ID

#### READ - Get Data from Database
**File:** `ExpressServer/controllers/product.controller.js`
```js
// GET ALL PRODUCTS FROM DATABASE
export const getProducts = async (req, res) => {
  try {
    console.log("📖 Fetching all products from database...");
    
    // Get all products from MongoDB
    const products = await Product.find();
    
    console.log(`✅ Found ${products.length} products in database`);
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET ONE PRODUCT BY ID
export const getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🔍 Finding product with ID:", productId);
    
    // Find specific product by MongoDB _id
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found in database" });
    }
    
    console.log("✅ Product found:", product.name);
    res.json(product);
  } catch (error) {
    console.error("❌ Error finding product:", error);
    res.status(500).json({ message: error.message });
  }
};
```
**What happens:**
1. `Product.find()` gets all products from MongoDB
2. `Product.findById()` gets specific product by database ID
3. Returns product data to frontend

#### UPDATE - Modify Existing Data
**File:** `ExpressServer/controllers/product.controller.js`
```js
// UPDATE PRODUCT IN DATABASE
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("✏️ Updating product ID:", productId);
    console.log("📝 New data:", req.body);
    
    // Find and update product in MongoDB
    const product = await Product.findByIdAndUpdate(
      productId,              // Find product by this ID
      req.body,               // Update with this new data
      { 
        new: true,            // Return updated product (not old one)
        runValidators: true   // Check validation rules
      }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Product not found in database" });
    }
    
    console.log("✅ Product updated in database:", product.name);
    res.json(product);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
};
```
**What happens:**
1. Finds product by MongoDB `_id`
2. Updates product with new data
3. Validates new data against schema rules
4. Returns updated product

#### DELETE - Remove Data
**File:** `ExpressServer/controllers/product.controller.js`
```js
// DELETE PRODUCT FROM DATABASE
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🗑️ Deleting product ID:", productId);
    
    // Find and delete product from MongoDB
    const product = await Product.findByIdAndDelete(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found in database" });
    }
    
    console.log("✅ Product deleted from database:", product.name);
    res.json({ 
      message: "Product deleted successfully",
      deletedProduct: product.name
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
};
```
**What happens:**
1. Finds product by MongoDB `_id`
2. Removes product from database permanently
3. Returns confirmation message

### STEP 4: API Routes (Connect URLs to Database Operations)

#### Product Routes
**File:** `ExpressServer/route/product.routes.js`
```js
import { Router } from "express";
import {
  createProduct,    // CREATE operation
  getProducts,      // READ ALL operation
  getProduct,       // READ ONE operation
  updateProduct,    // UPDATE operation
  deleteProduct     // DELETE operation
} from "../controllers/product.controller.js";

const router = Router();

// CONNECT URLS TO DATABASE OPERATIONS
router.post("/", createProduct);        // POST /api/products → Add to database
router.get("/", getProducts);           // GET /api/products → Get all from database
router.get("/:id", getProduct);         // GET /api/products/123 → Get one from database
router.put("/:id", updateProduct);      // PUT /api/products/123 → Update in database
router.delete("/:id", deleteProduct);   // DELETE /api/products/123 → Remove from database

export default router;
```

#### Connect Routes to Server
**File:** `ExpressServer/index.js`
```js
import productRoutes from "./route/product.routes.js";

// Connect product routes to server
app.use("/api/products", productRoutes);
```

### STEP 5: Frontend Connection to Database (Through Backend)

#### Frontend Data Store
**File:** `ReactApp/src/store/useProducts.ts`
```js
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useProducts = create((set, get) => ({
  products: [],
  loading: false,

  // LOAD DATA FROM DATABASE (via backend)
  fetchProducts: async () => {
    set({ loading: true });
    try {
      console.log("🔄 Fetching products from backend...");
      
      // Call backend API → Backend calls MongoDB → Returns data
      const response = await fetch(`${API_URL}/api/products`);
      const products = await response.json();
      
      console.log(`✅ Loaded ${products.length} products from database`);
      set({ products, loading: false });
    } catch (error) {
      console.error("❌ Error loading products:", error);
      set({ loading: false });
    }
  },

  // ADD DATA TO DATABASE (via backend)
  createProduct: async (productData) => {
    try {
      console.log("➕ Adding product to database:", productData);
      
      // Send data to backend → Backend saves to MongoDB
      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) throw new Error("Failed to create product");
      
      console.log("✅ Product added to database");
      await get().fetchProducts(); // Refresh list from database
    } catch (error) {
      console.error("❌ Error adding product:", error);
      throw error;
    }
  },

  // UPDATE DATA IN DATABASE (via backend)
  updateProduct: async (id, productData) => {
    try {
      console.log("✏️ Updating product in database:", id);
      
      // Send update to backend → Backend updates MongoDB
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) throw new Error("Failed to update product");
      
      console.log("✅ Product updated in database");
      await get().fetchProducts(); // Refresh list from database
    } catch (error) {
      console.error("❌ Error updating product:", error);
      throw error;
    }
  },

  // DELETE DATA FROM DATABASE (via backend)
  deleteProduct: async (id) => {
    try {
      console.log("🗑️ Deleting product from database:", id);
      
      // Send delete request to backend → Backend removes from MongoDB
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete product");
      
      console.log("✅ Product deleted from database");
      await get().fetchProducts(); // Refresh list from database
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      throw error;
    }
  },
}));
```

#### Frontend Table View
**File:** `ReactApp/src/pages/ProductsTable.tsx`
```js
import { useEffect } from "react";
import { useProducts } from "@/store/useProducts";

export default function ProductsTable() {
  const { products, loading, fetchProducts, deleteProduct } = useProducts();

  // LOAD DATA FROM DATABASE WHEN PAGE OPENS
  useEffect(() => {
    console.log("📱 Page loaded, fetching products from database...");
    fetchProducts(); // This calls backend → MongoDB
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Delete this product from database?")) {
      await deleteProduct(id); // This calls backend → MongoDB
    }
  };

  if (loading) return <div>Loading data from database...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products from Database</h1>
      
      {/* DISPLAY DATA FROM MONGODB */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Stock</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}> {/* MongoDB _id as key */}
              <td className="px-4 py-2 border">{product.name}</td>
              <td className="px-4 py-2 border">${product.price}</td>
              <td className="px-4 py-2 border">{product.category}</td>
              <td className="px-4 py-2 border">{product.stock}</td>
              <td className="px-4 py-2 border">
                <button 
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete from DB
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {products.length === 0 && (
        <p className="text-center mt-4">No products in database</p>
      )}
    </div>
  );
}
```

## Complete Data Flow

### 1. Database Connection Flow:
```
Server Start → connectDB() → MongoDB Connected → Ready for Operations
```

### 2. CREATE Data Flow:
```
Frontend Form → POST /api/products → Controller → Product.create() → MongoDB → Response → Frontend Updates
```

### 3. READ Data Flow:
```
Frontend Page Load → GET /api/products → Controller → Product.find() → MongoDB → Response → Table Display
```

### 4. UPDATE Data Flow:
```
Frontend Edit → PUT /api/products/123 → Controller → Product.findByIdAndUpdate() → MongoDB → Response → Frontend Refresh
```

### 5. DELETE Data Flow:
```
Frontend Delete Button → DELETE /api/products/123 → Controller → Product.findByIdAndDelete() → MongoDB → Response → Frontend Refresh
```

## MongoDB File Locations

### Backend Files:
```
ExpressServer/
├── config/db.js                    # Database connection
├── models/
│   ├── authuser.js                 # User collection structure
│   └── product.js                  # Product collection structure
├── controllers/
│   ├── auth.controller.js          # User database operations
│   └── product.controller.js       # Product database operations
├── route/
│   ├── auth.routes.js              # User API endpoints
│   └── product.routes.js           # Product API endpoints
├── index.js                        # Start connection
└── .env                            # Database URL
```

### Frontend Files:
```
ReactApp/src/
├── store/
│   ├── authStore.ts                # User data management
│   └── useProducts.ts              # Product data management
├── pages/
│   ├── ProductsTable.tsx           # Display database data
│   └── Dashboard.tsx               # Show data from database
└── .env                            # Backend API URL
```

## Common MongoDB Operations

### Find with Conditions:
```js
// Find products under $50
const cheapProducts = await Product.find({ price: { $lt: 50 } });

// Find products by category
const electronics = await Product.find({ category: "Electronics" });

// Find products with search
const searchResults = await Product.find({ 
  name: { $regex: searchTerm, $options: 'i' } 
});
```

### Pagination:
```js
// Get 10 products, skip first 20 (page 3)
const products = await Product.find()
  .skip(20)
  .limit(10)
  .sort({ createdAt: -1 }); // Newest first
```

### Count Documents:
```js
// Count total products
const totalProducts = await Product.countDocuments();

// Count products in category
const electronicsCount = await Product.countDocuments({ category: "Electronics" });
```

This guide shows the complete flow from MongoDB connection to displaying data in frontend tables, with all the database operations needed for a full-stack application.