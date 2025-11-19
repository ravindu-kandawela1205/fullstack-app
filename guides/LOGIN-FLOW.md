# User Login Flow Documentation

## Overview
Complete step-by-step guide of how user login works in the Full-Stack Authentication System.

## Login Flow Steps

### 1. User Interface - Login Form
**File:** `ReactApp/src/pages/Login.tsx`

**What happens:** User enters email and password credentials with password visibility toggle.

```jsx
// Form type definition
type LoginForm = {
  email: string;
  password: string;
};

// Form submission handler
const onSubmit = async (data: LoginForm) => {
  try {
    await login(data.email, data.password);
    nav("/"); // Redirect to dashboard after successful login
  } catch (err: any) {
    form.setError("root", { message: err?.message || "Login failed" });
  }
};

// Password visibility toggle
<div className="relative">
  <Input 
    type={showPassword ? "text" : "password"} 
    placeholder="Enter your password" 
    disabled={loading} 
    {...field} 
  />
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </Button>
</div>
```

**Key Features:**
- Email and password input fields
- Password visibility toggle (Eye/EyeOff icons)
- Form validation and error display
- Loading states during authentication
- Dark mode support
- Responsive design

---

### 2. Frontend State Management - Auth Store
**File:** `ReactApp/src/store/authStore.ts`

**What happens:** Login request is processed through Zustand store with user state management.

```js
login: async (email, password) => {
  set({ loading: true });
  try {
    const res = await request<{ user: { id: string; name: string; email: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    set({ user: res.user, loading: false }); // Save user in global state
  } catch (e: any) {
    set({ loading: false });
    throw e;
  }
}
```

**Key Features:**
- Global user state management
- Loading state tracking
- Automatic user data storage
- Error handling and propagation
- HTTP request with credentials

---

### 3. Backend Route Handler
**File:** `ExpressServer/route/auth.routes.js`

**What happens:** Express router directs POST request to login controller.

```js
import { Router } from "express";
import { login, register, me, logout, updateProfile, changePassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login); // Login endpoint
```

**Key Features:**
- RESTful API routing
- Controller method binding
- Middleware support ready

---

### 4. Input Validation - Zod Schema
**File:** `ExpressServer/validators/auth.schema.js`

**What happens:** Server validates login credentials using Zod schema.

```js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
```

**Key Features:**
- Email format validation
- Password presence check
- Type safety enforcement
- Consistent error messages

---

### 5. Login Controller Logic
**File:** `ExpressServer/controllers/auth.controller.js`

**What happens:** Main authentication logic verifies credentials and creates session.

```js
export async function login(req, res) {
  try {
    console.log("Login attempt:", req.body.email);
    
    // 1. Validate input data
    const parsed = loginSchema.parse(req.body);
    
    // 2. Find user by email
    const user = await User.findOne({ email: parsed.email });
    if (!user) {
      console.log("User not found:", parsed.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("User found:", user.email);
    
    // 3. Verify password against hash
    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) {
      console.log("Password mismatch for:", parsed.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Login successful for:", user.email);
    
    // 4. Generate JWT token
    const token = signToken({ sub: user._id, email: user.email });
    
    // 5. Set HTTP-only cookie
    setAuthCookie(res, token);

    // 6. Return success response with user data
    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profileImage: user.profileImage 
      },
      token,
    });
  } catch (err) {
    // Handle validation and server errors
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
```

**Security Features:**
- Password verification with bcrypt
- Generic error messages (security)
- JWT token generation
- HTTP-only cookie setting
- Comprehensive logging

---

### 6. Authentication Middleware
**File:** `ExpressServer/middleware/auth.middleware.js`

**What happens:** Middleware verifies JWT tokens for protected routes.

```js
export async function requireAuth(req, res, next) {
  try {
    // 1. Extract token from cookie or header
    const tokenFromCookie = req.cookies?.token;
    const auth = req.headers.authorization || "";
    const tokenFromHeader = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // 2. Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find user and attach to request
    const user = await User.findById(payload.sub).select("_id name email profileImage");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = { 
      id: user._id.toString(), 
      name: user.name, 
      email: user.email, 
      profileImage: user.profileImage 
    };
    next(); // Continue to protected route
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
```

**Key Features:**
- Token extraction from cookies/headers
- JWT verification and validation
- User lookup and attachment
- Comprehensive error handling
- Profile image support

---

### 7. Protected Route Verification
**File:** `ReactApp/src/components/ProtectedRoute.tsx`

**What happens:** Frontend component protects routes requiring authentication.

```jsx
export default function ProtectedRoute({ children }) {
  const { user, checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth(); // Verify authentication on component mount
  }, []);
  
  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }
  
  return <>{children}</>; // Render protected content if authenticated
}
```

**Key Features:**
- Automatic authentication check
- Redirect to login if unauthenticated
- Seamless user experience
- Route protection wrapper

---

### 8. Authentication Check - Me Endpoint
**File:** `ExpressServer/controllers/auth.controller.js`

**What happens:** Backend endpoint verifies current user session.

```js
export async function me(req, res) {
  try {
    // User data already attached by auth middleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
```

**Key Features:**
- Current user data retrieval
- Password hash exclusion
- Profile image inclusion
- Error handling

---

### 9. Frontend Authentication Check
**File:** `ReactApp/src/store/authStore.ts`

**What happens:** Frontend verifies authentication status on app load.

```js
checkAuth: async () => {
  try {
    const res = await request<{ user: { id: string; name: string; email: string } }>("/api/auth/me");
    set({ user: res.user, initialized: true }); // Set user if valid token
  } catch (e) {
    set({ user: null, initialized: true }); // Clear user if invalid token
  }
}
```

**Key Features:**
- Automatic session verification
- User state initialization
- Silent authentication check
- Error handling without user notification

---

## Login Success Flow

1. **Form Submission** → User clicks "Sign in"
2. **Client Validation** → Form validates email/password
3. **API Request** → POST to `/api/auth/login`
4. **Server Validation** → Backend validates with Zod
5. **User Lookup** → Find user by email in database
6. **Password Verification** → bcrypt compares password with hash
7. **Token Generation** → JWT token created with user ID
8. **Cookie Set** → HTTP-only cookie sent to browser
9. **Response** → Success response with user data
10. **State Update** → User data saved in global state
11. **Redirect** → User redirected to dashboard

## Post-Login Authentication Flow

1. **Route Protection** → ProtectedRoute component checks auth
2. **Auth Check** → Frontend calls `/api/auth/me`
3. **Token Verification** → Middleware verifies JWT token
4. **User Lookup** → Database query for current user
5. **Response** → User data returned if valid
6. **State Update** → Global user state updated
7. **Access Granted** → Protected content rendered

## Error Handling

**Client-Side Errors:**
- Invalid email format
- Empty password field
- Network connection issues
- Display in form error messages

**Server-Side Errors:**
- User not found (401 - Invalid credentials)
- Wrong password (401 - Invalid credentials)
- Invalid input (400 - Validation error)
- Server errors (500 - Internal error)

**Security Considerations:**
- Generic error messages prevent user enumeration
- Rate limiting should be implemented
- Account lockout after failed attempts

## Session Management

**JWT Token Features:**
- Contains user ID and email
- Signed with secret key
- Configurable expiration (7 days default)
- HTTP-only cookie storage

**Cookie Configuration:**
```js
{
  httpOnly: true,        // Prevent XSS attacks
  secure: isProd,        // HTTPS only in production
  sameSite: isProd ? "none" : "lax", // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}
```

## User Interface Features

**Login Form:**
- Email input with validation
- Password input with visibility toggle
- Loading states during authentication
- Error message display
- "Remember me" functionality (via persistent cookies)
- Link to registration page

**Dark Mode Support:**
- Automatic theme detection
- Consistent styling across themes
- Theme toggle in header
- Persistent theme preference

## Database Queries

**User Lookup:**
```js
// Find user by email (case-insensitive)
const user = await User.findOne({ email: parsed.email });

// Get user data without password
const user = await User.findById(userId).select('-passwordHash');

// Get user with profile image
const user = await User.findById(payload.sub).select("_id name email profileImage");
```

## Security Measures

1. **Password Security**
   - bcrypt hash verification
   - No plain text storage
   - Secure comparison timing

2. **Token Security**
   - JWT with secret signing
   - HTTP-only cookies
   - Secure transmission
   - Expiration handling

3. **Session Security**
   - Automatic token verification
   - Invalid token handling
   - Secure cookie attributes
   - CSRF protection

4. **Error Security**
   - Generic error messages
   - No user enumeration
   - Comprehensive logging
   - Rate limiting ready

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/dbconnect
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Testing Login

1. **Start Services**
   ```bash
   # Start MongoDB
   mongod
   
   # Start Backend
   cd ExpressServer && npm run dev
   
   # Start Frontend  
   cd ReactApp && npm run dev
   ```

2. **Test Login**
   - Navigate to `/login`
   - Enter registered email/password
   - Verify redirect to dashboard
   - Check browser cookies for token
   - Test protected route access

3. **Test Error Cases**
   - Invalid email format
   - Wrong password
   - Non-existent user
   - Network failures
   - Expired tokens

## Logout Flow

**File:** `ExpressServer/controllers/auth.controller.js`
```js
export function logout(_req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" });
  res.json({ message: "Logged out" });
}
```

**Logout Process:**
1. User clicks logout button
2. Frontend calls `/api/auth/logout`
3. Backend clears authentication cookie
4. Frontend clears user state
5. User redirected to login page