# Full-Stack Authentication System

## How Login & Register Work

### 1. Registration Flow
**Frontend → Backend → Database**

**Step 1: User fills form**
```jsx
// ReactApp/src/pages/Register.tsx
const onSubmit = async (data) => {
  await registerUser(data.name, data.email, data.password);
  nav("/login"); // Go to login page
};
```
**What happens:** User enters name, email, password and clicks "Sign up"

**Step 2: Form calls register function**
```js
// ReactApp/src/store/authStore.ts
register: async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
}
```
**What happens:** Sends user data to backend API

**Step 3: Backend processes request**
```js
// ExpressServer/controllers/auth.controller.js
export async function register(req, res) {
  const passwordHash = await bcrypt.hash(password, 10); // Encrypt password
  const user = await User.create({ name, email, passwordHash }); // Save to database
  res.status(201).json({ user }); // Send success response
}
```
**What happens:** Encrypts password → Saves user to MongoDB → Sends success message

**Step 4: User redirected to login**
**Result:** Account created, user can now login

### 2. Login Flow
**Frontend → Backend → Database → JWT Token**

**Step 1: User enters credentials**
```jsx
// ReactApp/src/pages/Login.tsx
const onSubmit = async (data) => {
  await login(data.email, data.password);
  nav("/"); // Go to dashboard
};
```
**What happens:** User enters email and password, clicks "Sign in"

**Step 2: Send login request**
```js
// ReactApp/src/store/authStore.ts
login: async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include", // Include cookies
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  set({ user: data.user }); // Save user in state
}
```
**What happens:** Sends credentials to backend, saves user data when successful

**Step 3: Backend verifies credentials**
```js
// ExpressServer/controllers/auth.controller.js
export async function login(req, res) {
  const user = await User.findOne({ email }); // Find user
  const ok = await bcrypt.compare(password, user.passwordHash); // Check password
  
  const token = jwt.sign({ sub: user._id }, JWT_SECRET); // Create login token
  res.cookie("token", token, { httpOnly: true }); // Save token in cookie
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
}
```
**What happens:** Finds user → Checks password → Creates login token → Sends user data

**Step 4: User logged in and redirected to dashboard**
**Result:** User is authenticated and can access protected pages

### 3. Route Protection
**Authentication Check on Every Protected Route**

**Step 1: Protected route checks authentication**
```jsx
// ReactApp/src/components/ProtectedRoute.tsx
export default function ProtectedRoute({ children }) {
  const { user, checkAuth } = useAuth();
  
  useEffect(() => {
    checkAuth(); // Check if user is logged in
  }, []);
  
  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }
  
  return <>{children}</>; // Show protected content if authenticated
}
```
**What happens:** Before showing dashboard, checks if user is logged in

**Step 2: Check authentication with backend**
```js
// ReactApp/src/store/authStore.ts
checkAuth: async () => {
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    credentials: "include" // Send login cookie
  });
  const data = await response.json();
  set({ user: data.user }); // Save user if valid
}
```
**What happens:** Asks backend "Is this user still logged in?"

**Step 3: Backend verifies login token**
```js
// ExpressServer/middleware/auth.middleware.js
export async function requireAuth(req, res, next) {
  const token = req.cookies?.token; // Get login token from cookie
  const payload = jwt.verify(token, JWT_SECRET); // Check if token is valid
  const user = await User.findById(payload.sub); // Find user
  
  req.user = user; // Add user to request
  next(); // Allow access to protected route
}
```
**What happens:** Checks login token → Finds user → Allows or denies access

**Step 4: Result**
- **If valid:** User sees dashboard
- **If invalid:** User redirected to login page

## Professional Folder Structure

### Backend Files
```
ExpressServer/
├── config/
│   ├── db.js                    # Database connection
│   └── cors.js                  # CORS configuration
├── controllers/
│   ├── auth.controller.js       # Register, login, logout logic
│   ├── product.controller.js    # Product operations
│   └── system.controller.js     # System info
├── models/
│   ├── authuser.js             # User schema for MongoDB
│   ├── user.js                 # Local user schema
│   └── product.js              # Product schema
├── route/
│   ├── auth.routes.js          # Auth endpoints (/register, /login, /me)
│   ├── product.routes.js       # Product endpoints
│   └── users.js                # User endpoints
├── middleware/
│   └── auth.middleware.js      # JWT verification
├── validators/
│   └── auth.schema.js          # Input validation with Zod
└── index.js                    # Clean main server file
```

### Frontend Files
```
ReactApp/src/
├── pages/Register.tsx           # Registration form
├── pages/Login.tsx              # Login form
├── store/authStore.ts           # Auth state management (Zustand)
├── components/ProtectedRoute.tsx # Route protection wrapper
├── components/layout/Header.tsx  # Logout button
└── components/layout/Sidebar.tsx # User info display
```

## How They Work Together

### 1. Database Connection
- MongoDB stores users in `authusers` collection
- Connection string: `mongodb://localhost:27017/dbconnect`
- Connection handled in `ExpressServer/models/authuser.js`

### 2. API Communication
- Frontend: `http://localhost:5173` (React/Vite)
- Backend: `http://localhost:8000` (Express)
- CORS enabled for cross-origin requests

### 3. Authentication Flow
```
Register: Form → Auth Store → POST /api/auth/register → MongoDB → Redirect to Login
Login:    Form → Auth Store → POST /api/auth/login → JWT Cookie → Dashboard
Protect:  Route Guard → GET /api/auth/me → JWT Verify → Allow/Deny Access
Logout:   Button → Auth Store → POST /api/auth/logout → Clear Cookie → Login Page
```

### 4. Security Features
- Passwords hashed with bcrypt
- JWT tokens stored in HTTP-only cookies
- Protected routes check authentication
- Input validation with Zod schemas

## Quick Start

1. **Start MongoDB**: `mongod`
2. **Start Backend**: `cd ExpressServer && npm run dev`
3. **Start Frontend**: `cd ReactApp && npm run dev`
4. **Register**: Go to `/register`, create account
5. **Login**: Go to `/login`, enter credentials
6. **Dashboard**: Access protected routes after login