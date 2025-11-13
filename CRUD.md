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

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Product name (required)
  price: { type: Number, required: true },       // Product price (required)
  category: { type: String, required: true },    // Product category (required)
  stock: { type: Number, default: 0 },          // Stock quantity (default 0)
  description: { type: String },                // Optional description
}, { timestamps: true });                       // Auto-add createdAt/updatedAt

export default mongoose.model("products", productSchema);
```
**What this does:**
- Defines the structure of product data in database
- Sets validation rules (required fields, data types)
- Creates "products" collection in MongoDB
- Automatically adds creation and update timestamps
- No database connection needed (handled by index.js)

#### Step 2: Create CRUD Controller
**File:** `ExpressServer/controllers/[your-entity].controller.js`
```js
import Product from "../models/product.js";

// CREATE - Add new product
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body); // Save new product to database
    res.status(201).json(product);                  // Send created product back
  } catch (error) {
    res.status(400).json({ message: error.message }); // Send error if validation fails
  }
};

// READ ALL - Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();          // Get all products from database
    res.json(products);                            // Send products list
  } catch (error) {
    res.status(500).json({ message: error.message }); // Send error if database fails
  }
};

// READ ONE - Get single product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Find product by ID
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);                                     // Send found product
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE - Modify existing product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,    // Find product by ID
      req.body,         // Update with new data
      { new: true }     // Return updated product (not old one)
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product); // Send updated product
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Remove product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id); // Delete by ID
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });          // Confirm deletion
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```
**What each function does:**
- **CREATE**: Takes product data from request → Saves to database → Returns created product
- **READ ALL**: Gets all products from database → Returns list
- **READ ONE**: Finds specific product by ID → Returns that product or "not found"
- **UPDATE**: Finds product by ID → Updates with new data → Returns updated product
- **DELETE**: Finds product by ID → Removes from database → Confirms deletion

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

// Connect URLs to controller functions
router.post("/", createProduct);        // POST /api/products - Create new product
router.get("/", getProducts);           // GET /api/products - Get all products
router.get("/:id", getProduct);         // GET /api/products/123 - Get product by ID
router.put("/:id", updateProduct);      // PUT /api/products/123 - Update product by ID
router.delete("/:id", deleteProduct);   // DELETE /api/products/123 - Delete product by ID

export default router;
```
**What this does:**
- Maps HTTP methods and URLs to controller functions
- POST = Create new item
- GET = Read/retrieve items
- PUT = Update existing item
- DELETE = Remove item
- `:id` means "any ID number" (like 123, 456, etc.)
- All routes start with `/api/products` (set in index.js)

#### Step 4: Add Routes to Main Server
**File:** `ExpressServer/index.js`
```js
import productRoutes from "./route/product.routes.js";

// Connect product routes to server
app.use("/api/products", productRoutes);
```
**What this does:**
- Tells server "when someone visits /api/products, use productRoutes"
- Now all product URLs work:
  - POST /api/products (create)
  - GET /api/products (get all)
  - GET /api/products/123 (get one)
  - PUT /api/products/123 (update)
  - DELETE /api/products/123 (delete)

### FRONTEND SETUP

#### Step 1: Create Data Store
**File:** `ReactApp/src/store/use[YourEntity].ts`
```js
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL; // Get backend URL from .env

// Define what a product looks like
type Product = {
  _id: string;        // Database ID
  name: string;       // Product name
  price: number;      // Product price
  category: string;   // Product category
  stock: number;      // Stock quantity
  description?: string; // Optional description
};

// Define what functions the store has
type ProductStore = {
  products: Product[];     // List of all products
  loading: boolean;        // Is data loading?
  fetchProducts: () => Promise<void>;    // Get all products from backend
  createProduct: (data: Omit<Product, "_id">) => Promise<void>; // Create new product
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>; // Update product
  deleteProduct: (id: string) => Promise<void>; // Delete product
};

export const useProducts = create<ProductStore>((set, get) => ({
  products: [],      // Start with empty list
  loading: false,    // Not loading initially

  // GET ALL PRODUCTS
  fetchProducts: async () => {
    set({ loading: true });                              // Show loading
    try {
      const response = await fetch(`${API_URL}/api/products`); // Call backend
      const products = await response.json();            // Get product data
      set({ products, loading: false });                 // Save products, hide loading
    } catch (error) {
      set({ loading: false });                          // Hide loading on error
      throw error;
    }
  },

  // CREATE NEW PRODUCT
  createProduct: async (data) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: "POST",                                    // Use POST method
      headers: { "Content-Type": "application/json" },  // Send JSON data
      body: JSON.stringify(data),                       // Convert data to JSON
    });
    if (!response.ok) throw new Error("Failed to create product");
    await get().fetchProducts();                        // Refresh product list
  },

  // UPDATE EXISTING PRODUCT
  updateProduct: async (id, data) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",                                     // Use PUT method
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update product");
    await get().fetchProducts();                        // Refresh product list
  },

  // DELETE PRODUCT
  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",                                  // Use DELETE method
    });
    if (!response.ok) throw new Error("Failed to delete product");
    await get().fetchProducts();                        // Refresh product list
  },
}));
```
**What this does:**
- **State Management**: Stores product list and loading status
- **API Calls**: Handles all communication with backend
- **Auto-refresh**: Updates product list after create/update/delete
- **Error Handling**: Throws errors if API calls fail
- **Loading States**: Shows when data is being fetched

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