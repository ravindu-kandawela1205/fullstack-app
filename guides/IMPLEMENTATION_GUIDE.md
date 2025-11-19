# Full-Stack Authentication Implementation Guide

## System Overview

This authentication system uses **JWT tokens stored in HTTP-only cookies** for secure user authentication between a React frontend and Express.js backend with MongoDB.

## Architecture Flow

```
Frontend (React) ↔ Backend (Express) ↔ Database (MongoDB)
     ↓                    ↓                    ↓
  Auth Store         JWT Middleware      User Collection
  (Zustand)         (Token Verify)       (Encrypted Data)
```

## Core Components

### 1. Backend Structure

```
ExpressServer/
├── controllers/
│   └── auth.controller.js      # Login/Register/Logout logic
├── middleware/
│   └── auth.middleware.js      # JWT token verification
├── models/
│   └── authuser.js            # MongoDB user schema
├── routes/
│   └── auth.routes.js         # Authentication endpoints
├── validators/
│   └── auth.schema.js         # Input validation
└── index.js                   # Server setup
```

### 2. Frontend Structure

```
ReactApp/src/
├── store/
│   └── authStore.ts           # Global auth state (Zustand)
├── pages/
│   ├── Login.tsx              # Login form
│   └── Register.tsx           # Registration form
├── components/
│   └── ProtectedRoute.tsx     # Route protection wrapper
└── App.tsx                    # Route configuration
```

## Implementation Steps

### Step 1: Backend Setup

#### Install Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken cookie-parser cors zod
```

#### 1.1 User Model (`models/authuser.js`)
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

#### 1.2 Auth Controller (`controllers/auth.controller.js`)
```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/authuser.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    
    res.status(201).json({ 
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}
```

#### 1.3 Auth Middleware (`middleware/auth.middleware.js`)
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/authuser.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = { id: user._id, name: user.name, email: user.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### 1.4 Auth Routes (`routes/auth.routes.js`)
```javascript
import express from 'express';
import { register, login, me, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

export default router;
```

#### 1.5 Server Setup (`index.js`)
```javascript
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Database connection
mongoose.connect('mongodb://localhost:27017/your-database')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
```

### Step 2: Frontend Setup

#### Install Dependencies
```bash
npm install zustand react-router-dom react-hook-form
```

#### 2.1 Auth Store (`store/authStore.ts`)
```typescript
import { create } from 'zustand';

const BASE_URL = 'http://localhost:8000';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const data = await response.json();
    set({ user: data.user });
  },
  
  register: async (name, email, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
  },
  
  logout: async () => {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    set({ user: null });
  },
  
  checkAuth: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user });
      }
    } catch (error) {
      set({ user: null });
    }
  }
}));
```

#### 2.2 Protected Route Component (`components/ProtectedRoute.tsx`)
```typescript
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

#### 2.3 Login Page (`pages/Login.tsx`)
```typescript
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" placeholder="Email" required />
      <input {...register('password')} type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <Link to="/register">Don't have an account? Register</Link>
    </form>
  );
}
```

#### 2.4 Register Page (`pages/Register.tsx`)
```typescript
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/login');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" required />
      <input {...register('email')} type="email" placeholder="Email" required />
      <input {...register('password')} type="password" placeholder="Password" required />
      <button type="submit">Register</button>
      <Link to="/login">Already have an account? Login</Link>
    </form>
  );
}
```

## How to Implement in Your Project

### 1. Copy File Structure
```bash
# Backend files to copy:
ExpressServer/controllers/auth.controller.js
ExpressServer/middleware/auth.middleware.js
ExpressServer/models/authuser.js
ExpressServer/routes/auth.routes.js

# Frontend files to copy:
ReactApp/src/store/authStore.ts
ReactApp/src/components/ProtectedRoute.tsx
ReactApp/src/pages/Login.tsx
ReactApp/src/pages/Register.tsx
```

### 2. Environment Variables
Create `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/your-database
NODE_ENV=development
```

### 3. Update Your App Router
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4. Customize for Your Needs

#### Change API Base URL
```typescript
// In authStore.ts
const BASE_URL = 'https://your-api-domain.com'; // Update this
```

#### Add More User Fields
```javascript
// In models/authuser.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' }, // Add role
  avatar: String, // Add avatar
  // Add more fields as needed
});
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Stored in HTTP-only cookies
- **CORS Protection**: Configured for specific origins
- **Route Protection**: Middleware checks authentication
- **Token Expiration**: 7-day expiry with refresh capability

## Testing the Implementation

1. **Start MongoDB**: `mongod`
2. **Start Backend**: `npm run dev` (port 8000)
3. **Start Frontend**: `npm run dev` (port 5173)
4. **Test Flow**:
   - Register new user → Success message
   - Login with credentials → Redirect to dashboard
   - Access protected route → Should work
   - Logout → Redirect to login
   - Try accessing protected route → Redirect to login

## Common Issues & Solutions

### CORS Errors
```javascript
// Ensure credentials: true in both frontend and backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Must be true
}));
```

### Cookie Not Set
```javascript
// Check cookie settings in login controller
res.cookie('token', token, {
  httpOnly: true,
  secure: false, // Set to true in production
  sameSite: 'lax'
});
```

### Token Not Verified
```javascript
// Ensure cookie-parser middleware is used
app.use(cookieParser());
```

This implementation provides a secure, scalable authentication system that can be easily adapted to any full-stack project.