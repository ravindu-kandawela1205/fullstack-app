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
- Create database connection function
- Handle connection errors

#### Step 4: CORS Configuration
**File:** `ExpressServer/config/cors.js`
- Setup CORS with credentials
- Configure allowed origins

#### Step 5: Main Server Setup
**File:** `ExpressServer/index.js`
- Import configurations and routes
- Setup middleware
- Start server

#### Step 6: User Model
**File:** `ExpressServer/models/authuser.js`
- Import dotenv for environment variables
- Connect to MongoDB
- Create user schema with name, email, passwordHash
- Export as "authusers" collection

#### Step 7: Input Validation
**File:** `ExpressServer/validators/auth.schema.js`
- Create Zod schemas for register and login
- Validate name, email, password fields

#### Step 8: Auth Controller
**File:** `ExpressServer/controllers/auth.controller.js`
- `register()`: Hash password, save user, create JWT
- `login()`: Verify credentials, create JWT
- `logout()`: Clear cookie
- `me()`: Return current user

#### Step 9: JWT Middleware
**File:** `ExpressServer/middleware/auth.middleware.js`
- Verify JWT from cookie or header
- Attach user to request object

#### Step 10: Auth Routes
**File:** `ExpressServer/route/auth.routes.js`
- POST /register
- POST /login
- POST /logout
- GET /me (protected)

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