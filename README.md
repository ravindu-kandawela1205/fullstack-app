# Full-Stack Authentication System

## How Login & Register Work

### 1. Registration Flow
**Frontend → Backend → Database**

1. User fills form in `ReactApp/src/pages/Register.tsx`
2. Form calls `register()` from `ReactApp/src/store/authStore.ts`
3. Auth store sends POST to `/api/auth/register`
4. Backend `ExpressServer/controllers/auth.controller.js` handles request
5. Password hashed with bcrypt, user saved to MongoDB `authusers` collection
6. User redirected to login page

### 2. Login Flow
**Frontend → Backend → Database → JWT Token**

1. User fills form in `ReactApp/src/pages/Login.tsx`
2. Form calls `login()` from `ReactApp/src/store/authStore.ts`
3. Auth store sends POST to `/api/auth/login`
4. Backend `ExpressServer/controllers/auth.controller.js` verifies credentials
5. JWT token created and sent as cookie
6. User data stored in auth store, redirected to dashboard

### 3. Route Protection
**Authentication Check on Every Protected Route**

1. `ReactApp/src/components/ProtectedRoute.tsx` wraps dashboard routes
2. Calls `checkAuth()` from auth store
3. Auth store sends GET to `/api/auth/me`
4. Backend `ExpressServer/middleware/auth.middleware.js` verifies JWT
5. If valid: user accesses dashboard, if not: redirected to login

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