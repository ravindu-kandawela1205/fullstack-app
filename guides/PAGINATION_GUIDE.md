# Pagination Implementation Guide

## How Pagination Works

Pagination divides large datasets into smaller, manageable chunks (pages) to improve performance and user experience.

## System Flow

```
Frontend Request → Backend Processing → Database Query → Paginated Response
     ↓                    ↓                    ↓                ↓
  Page Number         Calculate Skip      MongoDB Limit      Page Data
  (User clicks)       & Limit Values      & Skip Query       + Metadata
```

## Backend Implementation

### 1. Controller Logic (`controllers/product.controller.js`)

```javascript
export const getProducts = async (req, res) => {
  try {
    // Extract page from query parameters (default: page 1)
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Fixed items per page
    const skip = (page - 1) * limit; // Calculate items to skip
    
    // Database query with pagination
    const products = await Product.find()
      .skip(skip)           // Skip previous pages
      .limit(limit)         // Limit current page items
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Get total count for pagination metadata
    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);
    
    // Send paginated response
    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
```

### 2. How Skip & Limit Work

```javascript
// Example with 100 total products, 10 per page:

// Page 1: skip = (1-1) * 10 = 0,  limit = 10  → Items 1-10
// Page 2: skip = (2-1) * 10 = 10, limit = 10  → Items 11-20  
// Page 3: skip = (3-1) * 10 = 20, limit = 10  → Items 21-30
// Page 10: skip = (10-1) * 10 = 90, limit = 10 → Items 91-100
```

### 3. Route Setup (`routes/product.routes.js`)

```javascript
import express from 'express';
import { getProducts } from '../controllers/product.controller.js';

const router = express.Router();

// GET /api/products?page=1
router.get('/', getProducts);

export default router;
```

## Frontend Implementation

### 1. Product Store with Pagination (`store/productStore.ts`)

```typescript
import { create } from 'zustand';

interface Product {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductStore {
  products: Product[];
  pagination: PaginationInfo | null;
  loading: boolean;
  fetchProducts: (page?: number) => Promise<void>;
}

const BASE_URL = 'http://localhost:8000';

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  pagination: null,
  loading: false,
  
  fetchProducts: async (page = 1) => {
    set({ loading: true });
    
    try {
      const response = await fetch(`${BASE_URL}/api/products?page=${page}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      set({
        products: data.products,
        pagination: data.pagination,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch products:', error);
    }
  }
}));
```

### 2. Pagination Component (`components/Pagination.tsx`)

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasNext, 
  hasPrev 
}: PaginationProps) {
  return (
    <div className="pagination">
      {/* Previous Button */}
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        Previous
      </button>
      
      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={page === currentPage ? 'active' : ''}
        >
          {page}
        </button>
      ))}
      
      {/* Next Button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        Next
      </button>
      
      {/* Page Info */}
      <span>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
```

### 3. Products Page (`pages/Products.tsx`)

```typescript
import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import Pagination from '../components/Pagination';

export default function Products() {
  const { products, pagination, loading, fetchProducts } = useProductStore();
  
  useEffect(() => {
    fetchProducts(1); // Load first page on mount
  }, []);
  
  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Products</h1>
      
      {/* Products List */}
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      )}
      
      {/* Pagination Info */}
      {pagination && (
        <div className="pagination-info">
          Showing {products.length} of {pagination.totalItems} products
        </div>
      )}
    </div>
  );
}
```

## Advanced Pagination Features

### 1. Dynamic Page Size

```javascript
// Backend: Allow custom limit
export const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10; // Allow custom limit
  const maxLimit = 50; // Prevent too large requests
  
  const actualLimit = Math.min(limit, maxLimit);
  const skip = (page - 1) * actualLimit;
  
  // Rest of the logic...
};
```

```typescript
// Frontend: Page size selector
const [pageSize, setPageSize] = useState(10);

const fetchProducts = async (page = 1, limit = pageSize) => {
  const response = await fetch(`${BASE_URL}/api/products?page=${page}&limit=${limit}`);
  // Handle response...
};
```

### 2. Search with Pagination

```javascript
// Backend: Search + Pagination
export const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const search = req.query.search || '';
  
  // Build search query
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  } : {};
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Product.countDocuments(query);
  
  // Return paginated results...
};
```

### 3. Infinite Scroll Pagination

```typescript
// Frontend: Load more instead of page numbers
const useInfiniteProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = async () => {
    const response = await fetch(`${BASE_URL}/api/products?page=${page}`);
    const data = await response.json();
    
    setProducts(prev => [...prev, ...data.products]);
    setPage(prev => prev + 1);
    setHasMore(data.pagination.hasNext);
  };
  
  return { products, loadMore, hasMore };
};
```

## Performance Optimization

### 1. Database Indexing

```javascript
// Add indexes for better query performance
// In your MongoDB:
db.products.createIndex({ createdAt: -1 }); // For sorting
db.products.createIndex({ name: "text", description: "text" }); // For search
```

### 2. Caching

```javascript
// Backend: Cache total count
let cachedTotal = null;
let cacheTime = null;

export const getProducts = async (req, res) => {
  // Cache total count for 5 minutes
  if (!cachedTotal || Date.now() - cacheTime > 300000) {
    cachedTotal = await Product.countDocuments();
    cacheTime = Date.now();
  }
  
  const total = cachedTotal;
  // Rest of pagination logic...
};
```

## Implementation in Your Project

### 1. Copy Required Files

```bash
# Backend files:
controllers/product.controller.js  # Pagination logic
routes/product.routes.js          # API endpoints

# Frontend files:
store/productStore.ts             # State management
components/Pagination.tsx         # Pagination UI
pages/Products.tsx               # Products page
```

### 2. Customize Pagination Settings

```javascript
// Backend: Adjust limits
const DEFAULT_LIMIT = 10;  // Items per page
const MAX_LIMIT = 100;     // Maximum allowed limit

// Frontend: Customize UI
const PAGE_BUTTON_COUNT = 5; // Show 5 page buttons
const SHOW_PAGE_SIZE_SELECTOR = true; // Allow users to change page size
```

### 3. Add to Your Routes

```javascript
// Backend routes
app.use('/api/products', productRoutes);

// Frontend routes
<Route path="/products" element={<Products />} />
```

## Testing Pagination

1. **Create Test Data**: Add 50+ products to database
2. **Test Page Navigation**: Click through pages
3. **Test Edge Cases**: First page, last page, invalid page numbers
4. **Test Performance**: Monitor query times with large datasets
5. **Test Search**: Combine search with pagination

## Common Issues & Solutions

### Issue: Slow Queries
**Solution**: Add database indexes on sorted fields

### Issue: Inconsistent Results
**Solution**: Always use consistent sorting (e.g., by ID or timestamp)

### Issue: Memory Usage
**Solution**: Keep page size reasonable (10-50 items)

### Issue: SEO Problems
**Solution**: Use URL parameters for page numbers (`/products?page=2`)

## File Locations in Project

### Backend Structure
```
ExpressServer/
├── controllers/
│   └── product.controller.js    # Main pagination logic
├── routes/
│   └── product.routes.js        # GET /api/products?page=1
├── models/
│   └── product.js              # Product schema
└── index.js                    # Server setup with routes
```

### Frontend Structure
```
ReactApp/src/
├── store/
│   └── productStore.ts         # Zustand store with fetchProducts
├── components/
│   └── Pagination.tsx          # Reusable pagination component
├── pages/
│   └── Products.tsx            # Products page with pagination
└── App.tsx                     # Route configuration
```

### Key Files Explained

**Backend Files:**
- `product.controller.js` - Contains `getProducts` function with skip/limit logic
- `product.routes.js` - Defines `GET /` route that accepts `?page=` parameter
- `product.js` - MongoDB schema for products

**Frontend Files:**
- `productStore.ts` - Manages products array and pagination state
- `Pagination.tsx` - UI component with Previous/Next buttons and page numbers
- `Products.tsx` - Main page that displays products grid and pagination controls

### How Files Work Together

1. **User clicks page 2** → `Pagination.tsx` calls `onPageChange(2)`
2. **Page change triggers** → `Products.tsx` calls `fetchProducts(2)`
3. **Store makes request** → `productStore.ts` sends `GET /api/products?page=2`
4. **Backend processes** → `product.controller.js` calculates `skip=10, limit=10`
5. **Database query** → MongoDB returns items 11-20
6. **Response sent** → Backend returns products + pagination metadata
7. **UI updates** → Frontend displays new products and updates pagination buttons

This pagination system provides efficient data loading, good user experience, and scalable performance for large datasets.management
components/Pagination.tsx         # Pagination UI
pages/Products.tsx               # Products page
```

### 2. Customize Pagination Settings

```javascript
// Backend: Adjust limits
const DEFAULT_LIMIT = 10;  // Items per page
const MAX_LIMIT = 100;     // Maximum allowed limit

// Frontend: Customize UI
const PAGE_BUTTON_COUNT = 5; // Show 5 page buttons
const SHOW_PAGE_SIZE_SELECTOR = true; // Allow users to change page size
```

### 3. Add to Your Routes

```javascript
// Backend routes
app.use('/api/products', productRoutes);

// Frontend routes
<Route path="/products" element={<Products />} />
```

## Testing Pagination

1. **Create Test Data**: Add 50+ products to database
2. **Test Page Navigation**: Click through pages
3. **Test Edge Cases**: First page, last page, invalid page numbers
4. **Test Performance**: Monitor query times with large datasets
5. **Test Search**: Combine search with pagination

## Common Issues & Solutions

### Issue: Slow Queries
**Solution**: Add database indexes on sorted fields

### Issue: Inconsistent Results
**Solution**: Always use consistent sorting (e.g., by ID or timestamp)

### Issue: Memory Usage
**Solution**: Keep page size reasonable (10-50 items)

### Issue: SEO Problems
**Solution**: Use URL parameters for page numbers (`/products?page=2`)

This pagination system provides efficient data loading, good user experience, and scalable performance for large datasets.

---

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