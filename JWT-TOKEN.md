# JWT Token Implementation Guide

## How JWT Authentication Works

### What is JWT?
JWT (JSON Web Token) is a secure way to verify user identity. It's like a digital ID card that proves "this user is logged in."

### JWT Token Flow in This Project

```
Login → Create JWT → Store in Cookie → Send with Requests → Verify → Allow Access
```

## Step-by-Step JWT Implementation

### BACKEND: Creating & Managing JWT Tokens

#### Step 1: Install JWT Package
```bash
cd ExpressServer
npm install jsonwebtoken
```

#### Step 2: Create JWT Token (Login/Register)
**File:** `ExpressServer/controllers/auth.controller.js`
```js
import jwt from "jsonwebtoken";

// CREATE TOKEN - When user logs in or registers
export async function login(req, res) {
  // ... verify user credentials ...
  
  // Create JWT token with user ID
  const token = jwt.sign(
    { sub: user._id },              // Payload: user ID
    process.env.JWT_SECRET,         // Secret key (from .env)
    { expiresIn: "7d" }            // Token expires in 7 days
  );
  
  // Store token in HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,                 // JavaScript can't access it (security)
    secure: false,                  // Set to true in production (HTTPS)
    sameSite: "lax",               // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
  
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
}
```
**What this does:**
- Creates a JWT token containing user ID
- Signs token with secret key (only server knows this key)
- Stores token in browser cookie (secure, can't be accessed by JavaScript)
- Token expires automatically after 7 days

#### Step 3: Verify & Decode JWT Token (Protected Routes)
**File:** `ExpressServer/middleware/auth.middleware.js`
```js
import jwt from "jsonwebtoken";
import { User } from "../models/authuser.js";

// VERIFY & DECODE TOKEN - Check if user is authenticated
export async function requireAuth(req, res, next) {
  try {
    // Get token from cookie
    const token = req.cookies?.token;
    console.log("Raw token from cookie:", token);
    
    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }
    
    // DECODE & VERIFY token is valid and not expired
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token payload:", payload);
    // payload = { sub: "user_id_here", iat: 1234567890, exp: 1234567890 }
    
    // Extract user ID from decoded token
    const userId = payload.sub;
    console.log("User ID from token:", userId);
    
    // Get user from database using decoded user ID
    const user = await User.findById(userId).select("_id name email");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("User found from token:", user);
    
    // Add user info to request object for route to use
    req.user = { id: user._id, name: user.name, email: user.email };
    
    // Continue to protected route
    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}
```
**What this does:**
- Gets JWT token from browser cookie
- **DECODES** token to extract user information (payload)
- Verifies token signature and expiration
- Uses decoded user ID to find user in database
- Adds user info to request for route to use
- Blocks access if token is invalid/expired

**Token Decoding Process:**
1. Raw token: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzU..."`
2. Decoded payload: `{ sub: "675abc123", iat: 1234567890, exp: 1234567890 }`
3. Extract user ID: `"675abc123"`
4. Find user in database using this ID

#### Step 4: Clear JWT Token (Logout)
**File:** `ExpressServer/controllers/auth.controller.js`
```js
// CLEAR TOKEN - When user logs out
export function logout(req, res) {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,        // Set to true in production
    sameSite: "lax"
  });
  
  res.json({ message: "Logged out successfully" });
}
```
**What this does:**
- Removes JWT token from browser cookie
- User is now logged out and can't access protected routes

#### Step 5: Enable Cookie Parser
**File:** `ExpressServer/index.js`
```js
import cookieParser from 'cookie-parser';

// Enable cookie parsing middleware
app.use(cookieParser());
```
**What this does:**
- Allows server to read cookies from requests
- Required for `req.cookies.token` to work

### FRONTEND: Using JWT Tokens

#### Step 1: Send Cookies with Requests
**File:** `ReactApp/src/store/authStore.ts`
```js
// SEND COOKIES - Include cookies in all API requests
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",           // IMPORTANT: Send cookies with request
    headers: { 
      "Content-Type": "application/json", 
      ...(options.headers || {}) 
    },
    ...options,
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

// LOGIN - Get JWT token
login: async (email, password) => {
  const res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  set({ user: res.user }); // Save user data in state
},

// CHECK AUTH - Verify JWT token
checkAuth: async () => {
  try {
    const res = await request("/api/auth/me"); // Sends cookie automatically
    set({ user: res.user, initialized: true });
  } catch (e) {
    set({ user: null, initialized: true });
  }
},

// LOGOUT - Clear JWT token
logout: async () => {
  try {
    await request("/api/auth/logout", { method: "POST" });
    set({ user: null });
  } catch (e) {
    set({ user: null }); // Clear user even if request fails
  }
}
```
**What this does:**
- `credentials: "include"` automatically sends JWT cookie with every request
- Frontend doesn't need to manually handle tokens
- Browser manages cookie storage and sending

#### Step 2: Protect Routes
**File:** `ReactApp/src/components/ProtectedRoute.tsx`
```js
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/authStore";

// ROUTE PROTECTION - Check JWT token before showing page
export default function ProtectedRoute({ children }) {
  const { user, initialized, checkAuth } = useAuth();

  useEffect(() => {
    if (!initialized) {
      checkAuth(); // This sends JWT cookie to verify user
    }
  }, [initialized, checkAuth]);

  // Show loading while checking token
  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if no valid token
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show protected content if token is valid
  return <>{children}</>;
}
```
**What this does:**
- Checks if user has valid JWT token before showing protected pages
- Calls backend to verify token is still valid
- Redirects to login if token is missing/expired

#### Step 3.5: Using Decoded Token Data
**File:** `ExpressServer/controllers/auth.controller.js`
```js
// ME ROUTE - Return current user info from decoded token
export async function me(req, res) {
  // req.user was set by requireAuth middleware after decoding token
  console.log("Current user from decoded token:", req.user);
  
  res.json({ 
    user: req.user  // This comes from decoded JWT token
  });
}
```
**What this does:**
- Uses user information that was decoded from JWT token
- No need to decode token again (middleware already did it)
- Returns current user data to frontend

**File:** `ExpressServer/route/auth.routes.js`
```js
import { requireAuth } from "../middleware/auth.middleware.js";

// Protected route that uses decoded token
router.get("/me", requireAuth, me);  // requireAuth decodes token first
```
**What happens:**
1. Request comes with JWT cookie
2. `requireAuth` middleware decodes token → sets `req.user`
3. `me` controller uses `req.user` (already decoded)

## JWT Token Decoding Process

### What JWT Token Contains:
```js
// JWT has 3 parts separated by dots:
// header.payload.signature

// HEADER (algorithm info)
{
  "alg": "HS256",
  "typ": "JWT"
}

// PAYLOAD (user data) - THIS IS WHAT WE DECODE
{
  "sub": "675abc123def",     // User ID (subject)
  "iat": 1734567890,         // Issued at (timestamp)
  "exp": 1735172690          // Expires at (timestamp)
}

// SIGNATURE (verification)
// HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Where Token Decoding Happens:

**Backend Decoding:**
```
ExpressServer/middleware/auth.middleware.js
└── jwt.verify(token, secret) 
    ├── Decodes payload: { sub: "user_id", iat: 123, exp: 456 }
    ├── Verifies signature is valid
    ├── Checks expiration time
    └── Returns decoded payload
```

**Frontend (No Decoding Needed):**
```
ReactApp/src/store/authStore.ts
└── Just sends cookie automatically
    ├── No decoding in frontend
    ├── Backend handles all token processing
    └── Frontend gets user data from API response
```

### Token Usage Flow:
```
1. LOGIN:
   Backend creates token with user ID → Sends as cookie
   
2. PROTECTED REQUEST:
   Frontend sends cookie → Backend decodes token → Gets user ID → Finds user → Allows access
   
3. FRONTEND GETS USER:
   Backend sends user data (from decoded token) → Frontend saves in state
```

## JWT Token Security Features

### 1. HTTP-Only Cookies
```js
// Backend sets secure cookie
res.cookie("token", token, { httpOnly: true });
```
**Security benefit:** JavaScript cannot access the token, preventing XSS attacks

### 2. Token Expiration
```js
// Token expires automatically
const token = jwt.sign(payload, secret, { expiresIn: "7d" });
```
**Security benefit:** Even if token is stolen, it becomes useless after 7 days

### 3. Secret Key Verification
```js
// Only server with correct secret can verify token
jwt.verify(token, process.env.JWT_SECRET);
```
**Security benefit:** Tokens cannot be forged without the secret key

### 4. CORS with Credentials
```js
// Backend allows specific origin with cookies
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Frontend sends cookies to specific backend
credentials: "include"
```
**Security benefit:** Only your React app can send cookies to your backend

## JWT Token File Locations

### Backend Files:
```
ExpressServer/
├── controllers/auth.controller.js
│   ├── login() - Creates JWT token
│   ├── register() - Creates JWT token
│   └── logout() - Clears JWT token
├── middleware/auth.middleware.js
│   └── requireAuth() - Verifies JWT token
├── index.js
│   └── app.use(cookieParser()) - Enables cookie parsing
└── .env
    └── JWT_SECRET=your-secret-key
```

### Frontend Files:
```
ReactApp/src/
├── store/authStore.ts
│   ├── login() - Receives JWT token
│   ├── checkAuth() - Sends JWT token
│   └── logout() - Clears JWT token
├── components/ProtectedRoute.tsx
│   └── useEffect() - Verifies JWT token
└── .env
    └── VITE_API_URL=http://localhost:8000
```

## Common JWT Issues & Solutions

### 1. "Failed to fetch" Error
**Problem:** CORS not configured properly
**Solution:** 
```js
// Backend: Enable CORS with credentials
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Frontend: Include credentials in requests
credentials: "include"
```

### 2. "Token expired" Error
**Problem:** JWT token has expired
**Solution:** User needs to login again, or implement token refresh

### 3. "Invalid token" Error
**Problem:** Token is corrupted or JWT_SECRET changed
**Solution:** Clear cookies and login again

### 4. Token not sent with requests
**Problem:** Missing `credentials: "include"`
**Solution:** Add to all fetch requests that need authentication

## JWT vs Other Authentication Methods

### JWT Advantages:
- **Stateless:** Server doesn't need to store sessions
- **Scalable:** Works across multiple servers
- **Secure:** Signed and can be encrypted
- **Self-contained:** Contains all user info needed

### Why Cookies over localStorage:
- **More secure:** HTTP-only cookies can't be accessed by JavaScript
- **Automatic:** Browser sends cookies automatically
- **CSRF protection:** SameSite attribute prevents cross-site attacks

This JWT implementation provides secure, scalable authentication for your full-stack application.