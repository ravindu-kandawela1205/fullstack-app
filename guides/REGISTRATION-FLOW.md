# User Registration Flow Documentation

## Overview
Complete step-by-step guide of how user registration works in the Full-Stack Authentication System.

## Registration Flow Steps

### 1. User Interface - Registration Form
**File:** `ReactApp/src/pages/Register.tsx`

**What happens:** User fills out registration form with name, email, password, and password confirmation.

```jsx
// Form validation schema using Zod
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Form submission handler
const onSubmit = async (data: RegisterForm) => {
  try {
    await registerUser(data.name, data.email, data.password);
    nav("/login"); // Redirect to login after successful registration
  } catch (err: any) {
    form.setError("root", { message: err?.message || "Registration failed" });
  }
};
```

**Key Features:**
- Client-side validation with Zod schema
- Password confirmation matching
- Error handling and display
- Dark mode support
- Responsive design

---

### 2. Frontend State Management - Auth Store
**File:** `ReactApp/src/store/authStore.ts`

**What happens:** Registration request is sent to backend API through Zustand store.

```js
register: async (name, email, password) => {
  set({ loading: true });
  try {
    await request(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify({ name, email, password }) }
    );
    set({ loading: false });
  } catch (e: any) {
    set({ loading: false });
    throw e;
  }
}
```

**Key Features:**
- Loading state management
- HTTP request with credentials
- Error propagation to UI
- Base URL configuration

---

### 3. Backend Route Handler
**File:** `ExpressServer/route/auth.routes.js`

**What happens:** Express router directs POST request to registration controller.

```js
import { Router } from "express";
import { login, register, me, logout, updateProfile, changePassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register); // Registration endpoint
```

**Key Features:**
- RESTful routing
- Controller separation
- Middleware support

---

### 4. Input Validation - Zod Schema
**File:** `ExpressServer/validators/auth.schema.js`

**What happens:** Server validates incoming registration data using Zod schema.

```js
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});
```

**Key Features:**
- Server-side validation
- Type safety
- Consistent validation rules
- Error message generation

---

### 5. Registration Controller Logic
**File:** `ExpressServer/controllers/auth.controller.js`

**What happens:** Main registration business logic processes the request.

```js
export async function register(req, res) {
  try {
    console.log("Registration attempt:", req.body);
    
    // 1. Validate input data
    const parsed = registerSchema.parse(req.body);

    // 2. Check if email already exists
    const existing = await User.findOne({ email: parsed.email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    // 3. Hash password for security
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    console.log("Creating user with data:", { name: parsed.name, email: parsed.email });
    
    // 4. Create user in database
    const user = await User.create({ 
      name: parsed.name, 
      email: parsed.email, 
      passwordHash 
    });
    console.log("User created successfully:", user._id);

    // 5. Generate JWT token
    const token = signToken({ sub: user._id, email: user.email });
    
    // 6. Set HTTP-only cookie
    setAuthCookie(res, token);

    // 7. Return success response
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    // Handle validation and server errors
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
```

**Security Features:**
- Password hashing with bcrypt (10 rounds)
- Email uniqueness validation
- JWT token generation
- HTTP-only cookies
- Input sanitization

---

### 6. Database Model - User Schema
**File:** `ExpressServer/models/authuser.js`

**What happens:** MongoDB stores user data using Mongoose schema.

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, minlength: 2, maxlength: 60 },
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    profileImage: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("authusers", userSchema);
```

**Key Features:**
- Email uniqueness constraint
- Automatic timestamps
- Profile image support
- Data validation at schema level

---

### 7. Database Connection
**File:** `ExpressServer/config/db.js`

**What happens:** MongoDB connection is established for data persistence.

```js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dbconnect");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
```

**Key Features:**
- Environment variable configuration
- Error handling
- Connection logging
- Graceful failure handling

---

### 8. JWT Token Management
**File:** `ExpressServer/controllers/auth.controller.js`

**What happens:** JWT tokens are created and managed for authentication.

```js
// Token generation
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || "7d" 
  });
}

// Cookie configuration
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,        // Prevent XSS attacks
    secure: isProd,        // HTTPS only in production
    sameSite: isProd ? "none" : "lax", // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
}
```

**Security Features:**
- HTTP-only cookies (XSS protection)
- Secure flag for HTTPS
- SameSite protection (CSRF)
- Configurable expiration
- Environment-based settings

---

## Registration Success Flow

1. **Form Submission** → User clicks "Sign up"
2. **Client Validation** → Zod schema validates input
3. **API Request** → POST to `/api/auth/register`
4. **Server Validation** → Backend validates with Zod
5. **Email Check** → Verify email not already registered
6. **Password Hashing** → bcrypt hashes password (10 rounds)
7. **Database Save** → User created in MongoDB
8. **Token Generation** → JWT token created
9. **Cookie Set** → HTTP-only cookie sent to browser
10. **Response** → Success response with user data
11. **Redirect** → User redirected to login page

## Error Handling

**Client-Side Errors:**
- Form validation errors (Zod)
- Network request failures
- Display in form error messages

**Server-Side Errors:**
- Email already exists (409)
- Invalid input data (400)
- Database connection issues (500)
- JWT signing failures (500)

## Security Measures

1. **Password Security**
   - Minimum 8 characters
   - bcrypt hashing with 10 rounds
   - Never stored in plain text

2. **Email Security**
   - Uniqueness validation
   - Lowercase normalization
   - Database indexing

3. **Token Security**
   - JWT with secret key
   - HTTP-only cookies
   - Secure transmission
   - Configurable expiration

4. **Input Validation**
   - Client and server validation
   - Zod schema enforcement
   - SQL injection prevention
   - XSS protection

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/dbconnect
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Database Structure

**Collection:** `authusers`
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "$2b$10$...",
  "profileImage": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Testing Registration

1. **Start Services**
   ```bash
   # Start MongoDB
   mongod
   
   # Start Backend
   cd ExpressServer && npm run dev
   
   # Start Frontend  
   cd ReactApp && npm run dev
   ```

2. **Test Registration**
   - Navigate to `/register`
   - Fill form with valid data
   - Submit and verify redirect to login
   - Check MongoDB for new user record
   - Verify password is hashed

3. **Test Error Cases**
   - Duplicate email registration
   - Invalid email format
   - Short password
   - Password mismatch
   - Network failures