# CRUD Implementation Guide

## How CRUD Works in This Project

### Current CRUD Example: Users Management

**Backend Files:**
- `ExpressServer/models/user.js` - User data model
- `ExpressServer/controllers/user.controller.js` - CRUD operations
- `ExpressServer/route/users.routes.js` - CRUD API routes

**Frontend Files:**
- `ReactApp/src/pages/LocalUsersTable.tsx` - Display users table
- `ReactApp/src/store/useLocalUsers.ts` - State management
- `ReactApp/src/components/customUi/UserFormDialog.tsx` - Create/Edit form

## Step-by-Step CRUD Implementation

### BACKEND SETUP

#### Step 1: Create Data Model
**File:** `ExpressServer/models/[your-entity].js`
```js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGO_URL);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model("products", productSchema);
```

#### Step 2: Create CRUD Controller
**File:** `ExpressServer/controllers/[your-entity].controller.js`
```js
import Product from "../models/product.js";

// CREATE
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ ALL
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### Step 3: Create API Routes
**File:** `ExpressServer/route/[your-entity].routes.js`
```js
import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

const router = Router();

router.post("/", createProduct);        // POST /api/products
router.get("/", getProducts);           // GET /api/products
router.get("/:id", getProduct);         // GET /api/products/:id
router.put("/:id", updateProduct);      // PUT /api/products/:id
router.delete("/:id", deleteProduct);   // DELETE /api/products/:id

export default router;
```

#### Step 4: Add Routes to Main Server
**File:** `ExpressServer/index.js`
```js
import productRoutes from "./route/product.routes.js";

// Add this line with other routes
app.use("/api/products", productRoutes);
```

### FRONTEND SETUP

#### Step 1: Create Data Store
**File:** `ReactApp/src/store/use[YourEntity].ts`
```js
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
};

type ProductStore = {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (data: Omit<Product, "_id">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

export const useProducts = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const products = await response.json();
      set({ products, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createProduct: async (data) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create");
    await get().fetchProducts();
  },

  updateProduct: async (id, data) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update");
    await get().fetchProducts();
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete");
    await get().fetchProducts();
  },
}));
```

#### Step 2: Create Table Component
**File:** `ReactApp/src/pages/[YourEntity]Table.tsx`
```jsx
import { useEffect, useState } from "react";
import { useProducts } from "@/store/useProducts";
import { Button } from "@/components/ui/button";

export default function ProductsTable() {
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteProduct(id);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setShowForm(true)}>Add Product</Button>
      </div>

      <div className="overflow-x-auto">
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
              <tr key={product._id}>
                <td className="px-4 py-2 border">{product.name}</td>
                <td className="px-4 py-2 border">${product.price}</td>
                <td className="px-4 py-2 border">{product.category}</td>
                <td className="px-4 py-2 border">{product.stock}</td>
                <td className="px-4 py-2 border">
                  <Button size="sm" className="mr-2">Edit</Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Professional CRUD Structure

### Backend Structure
```
ExpressServer/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── auth.controller.js
│   ├── product.controller.js  # CRUD operations
│   └── user.controller.js
├── models/
│   ├── authuser.js
│   ├── product.js         # Data schema
│   └── user.js
├── route/
│   ├── auth.routes.js
│   ├── product.routes.js  # CRUD endpoints
│   └── user.routes.js
└── index.js
```

## Customization for Different Data

### 1. Change Model Schema
**File:** `ExpressServer/models/[entity].js`
```js
// Example: Blog Posts
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  publishDate: { type: Date },
}, { timestamps: true });
```

### 2. Update Controller Functions
**File:** `ExpressServer/controllers/[entity].controller.js`
- Keep same CRUD structure
- Change validation logic if needed
- Add custom business logic

### 3. Modify Frontend Types
**File:** `ReactApp/src/store/use[Entity].ts`
```js
type BlogPost = {
  _id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  published: boolean;
  publishDate?: Date;
};
```

## Quick Implementation Checklist

**Backend:**
- [ ] Create model with your fields in models/ folder
- [ ] Create controller with CRUD operations in controllers/ folder
- [ ] Create routes file in route/ folder
- [ ] Add routes to main server index.js

**Frontend:**
- [ ] Create store with your data type in store/ folder
- [ ] Create table component in pages/ folder
- [ ] Create form component in components/ folder
- [ ] Add route to App.tsx
- [ ] Add navigation link

This guide provides a complete CRUD implementation following the professional folder structure that you can adapt for any data structure.