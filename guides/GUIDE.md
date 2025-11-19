# Implementation Guide: Register & Login System

## Step-by-Step Implementation Guide

### BACKEND SETUP

#### Step 1: Install Dependencies
```bash
cd ExpressServer
npm install express mongoose bcryptjs jsonwebtoken cookie-parser cors dotenv zod
```

#### Step 2: Environment Variables
**File:** `ExpressServer/.env`
```
PORT=8000
MONGO_URL=mongodb://localhost:27017/dbconnect
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

#### Step 3: Database Configuration
**File:** `ExpressServer/config/db.js`
```js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Stop server if database fails
  }
};

export default connectDB;
```
**What this does:**
- Creates a function to connect to MongoDB
- Uses environment variable for database URL
- Shows success/error messages
- Stops server if database connection fails

#### Step 4: CORS Configuration
**File:** `ExpressServer/config/cors.js`
```js
import cors from 'cors';

const corsOptions = {
  origin: process.env.CLIENT_URL, // Allow React app
  credentials: true               // Allow cookies
};

export default cors(corsOptions);
```
**What this does:**
- Allows React app (localhost:5173) to call backend
- Enables cookies to be sent between frontend/backend
- Prevents other websites from accessing your API

#### Step 5: Main Server Setup
**File:** `ExpressServer/index.js`
```js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from "./route/auth.routes.js";

dotenv.config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware (runs before routes)
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());    // Parse JSON from requests
app.use(cookieParser());    // Parse cookies from requests

// Routes
app.use("/api/auth", authRoutes); // All auth routes start with /api/auth

// Connect to database then start server
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
**What this does:**
- Loads environment variables from .env file
- Sets up middleware to handle JSON, cookies, CORS
- Connects all auth routes to /api/auth path
- Connects to database first, then starts server

#### Step 6: User Model
**File:** `ExpressServer/models/authuser.js`
```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 60 },
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model("authusers", userSchema);
```
**What this does:**
- Defines what user data looks like (name, email, password)
- Sets validation rules (required, unique, length limits)
- Creates "authusers" collection in MongoDB
- Automatically adds createdAt/updatedAt timestamps
- No database connection needed (index.js handles it)

#### Step 7: Input Validation
**File:** `ExpressServer/validators/auth.schema.js`
```js
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```
**What this does:**
- Checks if register data is valid (name 2-60 chars, valid email, password 8+ chars)
- Checks if login data is valid (valid email, password not empty)
- Prevents bad data from reaching database
- Returns clear error messages if validation fails

#### Step 8: Auth Controller
**File:** `ExpressServer/controllers/auth.controller.js`
```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/authuser.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";

// REGISTER: Create new user
export async function register(req, res) {
  try {
    const parsed = registerSchema.parse(req.body); // Validate input
    
    const existing = await User.findOne({ email: parsed.email });
    if (existing) return res.status(409).json({ message: "Email already exists" });
    
    const passwordHash = await bcrypt.hash(parsed.password, 10); // Encrypt password
    const user = await User.create({ name: parsed.name, email: parsed.email, passwordHash });
    
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true }); // Save token in cookie
    
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// LOGIN: Check credentials
export async function login(req, res) {
  try {
    const parsed = loginSchema.parse(req.body); // Validate input
    
    const user = await User.findOne({ email: parsed.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    const ok = await bcrypt.compare(parsed.password, user.passwordHash); // Check password
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true }); // Save token in cookie
    
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
```
**What this does:**
- **Register**: Validates data → Checks if email exists → Encrypts password → Saves user → Creates login token → Sends success
- **Login**: Validates data → Finds user by email → Checks password → Creates login token → Sends success
- Uses JWT tokens stored in cookies for authentication
- Never stores plain text passwords (always encrypted)

#### Step 9: JWT Middleware
**File:** `ExpressServer/middleware/auth.middleware.js`
```js
import jwt from "jsonwebtoken";
import { User } from "../models/authuser.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token; // Get token from cookie
    if (!token) return res.status(401).json({ message: "Not logged in" });
    
    const payload = jwt.verify(token, process.env.JWT_SECRET); // Check if token is valid
    const user = await User.findById(payload.sub); // Find user from token
    if (!user) return res.status(401).json({ message: "User not found" });
    
    req.user = { id: user._id, name: user.name, email: user.email }; // Add user to request
    next(); // Continue to next function
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
```
**What this does:**
- Runs before protected routes (like /api/auth/me)
- Gets login token from cookie
- Checks if token is valid and not expired
- Finds user from database using token
- Adds user info to request so route can use it
- Blocks access if no token or invalid token

#### Step 10: Auth Routes
**File:** `ExpressServer/route/auth.routes.js`
```js
import { Router } from "express";
import { login, register, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);     // POST /api/auth/register
router.post("/login", login);           // POST /api/auth/login
router.get("/me", requireAuth, me);     // GET /api/auth/me (protected)
router.post("/logout", logout);         // POST /api/auth/logout

export default router;
```
**What this does:**
- Connects URLs to controller functions
- `/register` → calls register function
- `/login` → calls login function  
- `/me` → checks authentication first, then calls me function
- `/logout` → calls logout function
- All routes start with `/api/auth` (set in index.js)

### FRONTEND SETUP

#### Step 1: Install Dependencies
```bash
cd ReactApp
npm install zustand react-hook-form @hookform/resolvers/zod zod react-router-dom
```

#### Step 2: Environment Variables
**File:** `ReactApp/.env`
```
VITE_API_URL=http://localhost:8000
```

#### Step 3: Auth Store
**File:** `ReactApp/src/store/authStore.ts`
- Create Zustand store with user state
- Add register(), login(), logout(), checkAuth() functions
- Handle API requests with fetch

#### Step 4: Register Page
**File:** `ReactApp/src/pages/Register.tsx`
- Create form with name, email, password, confirmPassword
- Use react-hook-form with Zod validation
- Call authStore.register() on submit
- Redirect to /login on success

#### Step 5: Login Page
**File:** `ReactApp/src/pages/Login.tsx`
- Create form with email, password
- Use react-hook-form with validation
- Call authStore.login() on submit
- Redirect to dashboard on success

#### Step 6: Protected Routes
**File:** `ReactApp/src/components/ProtectedRoute.tsx`
- Check if user is authenticated
- Call checkAuth() on mount
- Redirect to /login if not authenticated

#### Step 7: Public Routes
**File:** `ReactApp/src/components/PublicRoute.tsx`
- Redirect authenticated users away from login/register
- Redirect to dashboard if already logged in

#### Step 8: Update App Routes
**File:** `ReactApp/src/App.tsx`
- Wrap login/register with PublicRoute
- Wrap dashboard routes with ProtectedRoute

#### Step 9: Header Component
**File:** `ReactApp/src/components/layout/Header.tsx`
- Add logout button functionality
- Display current user name
- Call authStore.logout() and redirect

#### Step 10: Sidebar Component
**File:** `ReactApp/src/components/layout/Sidebar.tsx`
- Display current user info
- Show user name and email from authStore

## Professional Folder Structure

### Backend Structure
```
ExpressServer/
├── config/
│   ├── db.js          # Database connection
│   └── cors.js        # CORS configuration
├── controllers/
│   └── auth.controller.js
├── models/
│   └── authuser.js
├── middleware/
│   └── auth.middleware.js
├── route/
│   └── auth.routes.js
├── validators/
│   └── auth.schema.js
└── index.js           # Clean main server
```

## What to Change for Your Project

### 1. Database Collection Name
**File:** `ExpressServer/models/authuser.js`
```js
// Change "authusers" to your preferred collection name
export const User = mongoose.model("users", userSchema);
```

### 2. User Schema Fields
**File:** `ExpressServer/models/authuser.js`
```js
// Add more fields as needed
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  // Add your custom fields here
  role: { type: String, default: "user" },
  avatar: { type: String },
});
```

### 3. Validation Rules
**File:** `ExpressServer/validators/auth.schema.js`
```js
// Modify validation rules
export const registerSchema = z.object({
  name: z.string().min(2).max(50), // Change length requirements
  email: z.string().email(),
  password: z.string().min(6), // Change password requirements
});
```

### 4. API Base URL
**File:** `ReactApp/.env`
```
# Change to your backend URL
VITE_API_URL=http://your-backend-url:port
```

### 5. Redirect Routes
**File:** `ReactApp/src/pages/Login.tsx` & `Register.tsx`
```js
// Change redirect destinations
nav("/dashboard"); // Change to your preferred route
```

## Quick Implementation Checklist

- [ ] Setup professional folder structure
- [ ] Create config files (db.js, cors.js)
- [ ] Setup MongoDB connection in model
- [ ] Create user model with proper schema
- [ ] Add environment variables
- [ ] Implement auth controller
- [ ] Create auth routes
- [ ] Setup JWT middleware
- [ ] Create auth store
- [ ] Build register/login forms
- [ ] Add route protection
- [ ] Update navigation components
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test logout functionality
- [ ] Test route protection

## Common Issues & Solutions

1. **CORS Error**: Check CLIENT_URL in .env matches frontend URL
2. **JWT Error**: Ensure JWT_SECRET is set in backend .env
3. **MongoDB Connection**: Verify MongoDB is running and URL is correct
4. **Cookie Issues**: Check CORS credentials: true is set
5. **Route Protection**: Ensure ProtectedRoute wraps all protected routes