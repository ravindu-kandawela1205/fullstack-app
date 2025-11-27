# User Registration with Default Role & Admin Role Assignment via Postman

## Overview
This guide shows how to:
1. Remove role selection from registration form
2. Auto-assign "user" role to all new registrations
3. Allow admin to change user roles via Postman API

---

## Table of Contents
1. [Current vs New Flow](#current-vs-new-flow)
2. [Backend Changes](#backend-changes)
3. [Frontend Changes](#frontend-changes)
4. [Admin Role Assignment via Postman](#admin-role-assignment-via-postman)
5. [Testing](#testing)
6. [File Summary](#file-summary)

---

## Current vs New Flow

### Current Flow
```
User Registration Form
├── Name: [input]
├── Email: [input]
├── Role: [dropdown - user/admin] ← User selects role
└── Submit
```

### New Flow
```
User Registration Form
├── Name: [input]
├── Email: [input]
└── Submit → Auto-assigned "user" role

Admin Changes Role (via Postman)
└── PUT /api/users/:id/role
    Body: { "role": "admin" }
```

---

## Backend Changes

### Step 1: Update Auth Schema Validator

**File**: `ExpressServer/validators/auth.schema.js`

**CURRENT CODE**:
```javascript
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  role: z.string().optional(),  // ← Role is optional
});
```

**CHANGE TO**:
```javascript
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  // ← REMOVED: role field completely
});
```

**What changed**: Removed `role` field from validation schema

---

### Step 2: Update Auth Controller

**File**: `ExpressServer/controllers/auth.controller.js`

**FIND THIS CODE** (around line 30):
```javascript
const user = await User.create({ 
  name: parsed.name, 
  email: parsed.email, 
  passwordHash,
  role: parsed.role || "user"  // ← Uses role from request or defaults to "user"
});
```

**CHANGE TO**:
```javascript
const user = await User.create({ 
  name: parsed.name, 
  email: parsed.email, 
  passwordHash,
  role: "user"  // ← ALWAYS "user" for new registrations
});
```

**What changed**: Hardcoded role to "user", ignoring any role from request

---

### Step 3: Create Admin Role Update Endpoint

**File**: `ExpressServer/controllers/auth.controller.js`

**ADD THIS NEW FUNCTION** at the end of the file:

```javascript
/**
 * Update auth user role (Admin only)
 * PUT /api/auth/users/:id/role
 */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role. Must be 'user' or 'admin'" 
      });
    }

    // Find and update auth user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-passwordHash' }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Role updated: ${user.email} → ${role}`);

    res.json({
      message: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
```

**Note**: This updates **Auth Users** (login system), not Local Users (data management).

---

### Step 4: Add Route for Role Update

**File**: `ExpressServer/route/auth.routes.js`

**FIND THIS CODE**:
```javascript
import { Router } from "express";
import { register, login, logout, changePassword, updateProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/change-password", verifyToken, changePassword);
router.put("/profile", verifyToken, updateProfile);

export default router;
```

**CHANGE TO**:
```javascript
import { Router } from "express";
import { register, login, logout, changePassword, updateProfile, updateUserRole } from "../controllers/auth.controller.js";  // ← ADD updateUserRole
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/change-password", verifyToken, changePassword);
router.put("/profile", verifyToken, updateProfile);
router.put("/users/:id/role", verifyToken, updateUserRole);  // ← NEW ROUTE

export default router;
```

**What changed**: 
- Imported `updateUserRole` function
- Added new route: `PUT /api/auth/users/:id/role`

**Important**: This is in `auth.routes.js`, NOT `users.js` (different systems)

---

## Frontend Changes

### Step 5: Update Register Component

**File**: `ReactApp/src/pages/loginAndRegister/Register.tsx`

**FIND THIS CODE** (Zod schema):
```typescript
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  role: z.string().min(1, 'Please select a role'),  // ← Role validation
});
```

**CHANGE TO**:
```typescript
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  // ← REMOVED: role field
});
```

---

**FIND THIS CODE** (form defaults):
```typescript
const form = useForm<RegisterForm>({
  resolver: zodResolver(registerSchema),
  defaultValues: { name: '', email: '', role: 'user' },  // ← Has role
  mode: 'onSubmit',
});
```

**CHANGE TO**:
```typescript
const form = useForm<RegisterForm>({
  resolver: zodResolver(registerSchema),
  defaultValues: { name: '', email: '' },  // ← REMOVED: role
  mode: 'onSubmit',
});
```

---

**FIND THIS CODE** (onSubmit function):
```typescript
const onSubmit = async (data: RegisterForm) => {
  try {
    await registerUser(data.name, data.email, data.role);  // ← Sends role
    setSuccessMessage('Registration successful! Check your email for login credentials.');
    // ...
  }
};
```

**CHANGE TO**:
```typescript
const onSubmit = async (data: RegisterForm) => {
  try {
    await registerUser(data.name, data.email);  // ← REMOVED: role parameter
    setSuccessMessage('Registration successful! Check your email for login credentials.');
    // ...
  }
};
```

---

**FIND AND DELETE THIS ENTIRE SECTION** (Role dropdown field):
```typescript
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**DELETE THE ENTIRE BLOCK ABOVE** ← Remove role selection dropdown

---

### Step 6: Update Auth Store

**File**: `ReactApp/src/store/authStore.ts`

**FIND THIS CODE**:
```typescript
register: async (name: string, email: string, role: string) => {  // ← Has role parameter
  set({ loading: true, error: null });
  try {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      role,  // ← Sends role
    });
    // ...
  }
},
```

**CHANGE TO**:
```typescript
register: async (name: string, email: string) => {  // ← REMOVED: role parameter
  set({ loading: true, error: null });
  try {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      // ← REMOVED: role field
    });
    // ...
  }
},
```

**What changed**: 
- Removed `role` parameter from function signature
- Removed `role` from request body

---

## Admin Role Assignment via Postman

### Step 1: Get Auth User ID

**Request**: Get all auth users (login to get your token first)
```
GET http://localhost:8000/api/auth/users
Headers:
  Cookie: token=your_jwt_token_here
```

**Note**: You may need to create this endpoint or use MongoDB Compass to find user `_id`.

**Alternative**: Check MongoDB directly:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Database: `dbconnect`
4. Collection: `authusers`
5. Find user and copy `_id`

---

### Step 2: Update Auth User Role to Admin

**Request**: Update role
```
PUT http://localhost:8000/api/auth/users/507f1f77bcf86cd799439011/role
Headers:
  Content-Type: application/json
  Cookie: token=your_jwt_token_here
Body (raw JSON):
{
  "role": "admin"
}
```

**Response**:
```json
{
  "message": "Role updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

### Step 3: Verify Role Change

**Option 1**: Login again and check role in response
```
POST http://localhost:8000/api/auth/login
Body:
{
  "email": "john@example.com",
  "password": "your_password"
}
```

**Option 2**: Check MongoDB Compass
- Collection: `authusers`
- Find user by email
- Check `role` field = "admin"

**Option 3**: Check frontend - admin features should now be visible

---

## Important Notes

### Two Separate User Systems

**Auth Users** (Login System):
- Model: `authuser.js`
- Routes: `/api/auth/*`
- Purpose: Authentication
- Fields: name, email, passwordHash, role
- This guide applies here ✅

**Local Users** (Data Management):
- Model: `user.js`
- Routes: `/api/users/*`
- Purpose: CRUD operations
- Fields: firstname, lastname, age, gender, email, birthdate, image
- This guide does NOT apply here ❌

---

## File Summary

### Files Modified:
```
Backend:
├── ExpressServer/validators/auth.schema.js (remove role validation)
├── ExpressServer/controllers/auth.controller.js (hardcode role, add updateUserRole)
└── ExpressServer/route/auth.routes.js (add role update route)

Frontend:
├── ReactApp/src/pages/Register.tsx (remove role field)
└── ReactApp/src/store/authStore.ts (remove role parameter)
```

### New Endpoint:
```
PUT /api/auth/users/:id/role
Body: { "role": "admin" }
```

---

## Testing Checklist

- [ ] Register new user (no role selection)
- [ ] Check MongoDB - user has role="user"
- [ ] Get user ID from MongoDB
- [ ] Use Postman to update role to "admin"
- [ ] Login with updated user
- [ ] Verify admin features are accessible

---

## Troubleshooting

**Can't find user ID?**
- Use MongoDB Compass
- Collection: `authusers`
- Copy `_id` field

**Role update not working?**
- Check you're using `/api/auth/users/:id/role` (not `/api/users/:id/role`)
- Verify JWT token in Cookie header
- Check backend console for errors

**Still see role dropdown?**
- Clear browser cache
- Restart dev server
- Check Register.tsx file was savedser Role
```
Method: PUT
URL: http://localhost:8000/api/users/{{user_id}}/role
Headers:
  Content-Type: application/json
  Cookie: token={{jwt_token}}
Body (raw JSON):
{
  "role": "admin"
}
```

#### 3. Change Role Back to User
```
Method: PUT
URL: http://localhost:8000/api/users/{{user_id}}/role
Headers:
  Content-Type: application/json
  Cookie: token={{jwt_token}}
Body (raw JSON):
{
  "role": "user"
}
```

---

## Testing

### Test 1: User Registration

1. **Start servers**:
```bash
# Terminal 1 - Backend
cd ExpressServer
npm run dev

# Terminal 2 - Frontend
cd ReactApp
npm run dev
```

2. **Register new user**:
   - Go to http://localhost:5173/register
   - Enter name: "Test User"
   - Enter email: "test@example.com"
   - Click "Sign up"
   - ✅ Should NOT see role dropdown
   - ✅ Should receive email with password

3. **Verify default role**:
   - Check MongoDB or use Postman GET /api/users
   - ✅ User should have `role: "user"`

---

### Test 2: Admin Role Assignment

1. **Login as existing admin** (or use your main admin account)

2. **Get user ID**:
   - Postman: GET http://localhost:8000/api/users
   - Copy the `_id` of "Test User"

3. **Update role to admin**:
   - Postman: PUT http://localhost:8000/api/users/{user_id}/role
   - Body: `{ "role": "admin" }`
   - ✅ Should return success message

4. **Verify role change**:
   - Postman: GET http://localhost:8000/api/users
   - ✅ User should now have `role: "admin"`

---

### Test 3: Invalid Role

1. **Try invalid role**:
   - Postman: PUT http://localhost:8000/api/users/{user_id}/role
   - Body: `{ "role": "superadmin" }`
   - ✅ Should return 400 error: "Invalid role"

---

## File Summary

### Files Changed

| File | Path | Changes |
|------|------|---------|
| **Auth Schema** | `ExpressServer/validators/auth.schema.js` | Removed `role` field |
| **Auth Controller** | `ExpressServer/controllers/auth.controller.js` | Hardcoded `role: "user"` |
| **User Controller** | `ExpressServer/controllers/user.controller.js` | Added `updateUserRole()` function |
| **User Routes** | `ExpressServer/route/users.js` | Added `PUT /:id/role` route |
| **Register Page** | `ReactApp/src/pages/loginAndRegister/Register.tsx` | Removed role dropdown & validation |
| **Auth Store** | `ReactApp/src/store/authStore.ts` | Removed role parameter |

### Files NOT Changed

- `ExpressServer/models/authuser.js` - Model already has role field
- `ExpressServer/index.js` - No changes needed
- `ReactApp/src/pages/loginAndRegister/Login.tsx` - No changes needed

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER REGISTERS (Frontend)                                   │
│    - Enters: Name, Email                                        │
│    - NO role selection                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND CREATES USER                                         │
│    - Auto-assigns: role = "user"                                │
│    - Saves to MongoDB                                           │
│    - Sends email with password                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. USER IN DATABASE                                             │
│    {                                                            │
│      "_id": "507f...",                                          │
│      "name": "John Doe",                                        │
│      "email": "john@example.com",                               │
│      "role": "user"  ← Default role                             │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. ADMIN WANTS TO PROMOTE USER                                  │
│    - Admin logs in                                              │
│    - Opens Postman                                              │
│    - Gets user ID from GET /api/users                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. ADMIN UPDATES ROLE VIA POSTMAN                               │
│    PUT /api/users/507f.../role                                  │
│    Body: { "role": "admin" }                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND UPDATES ROLE                                         │
│    - Validates role (user/admin only)                           │
│    - Updates MongoDB                                            │
│    - Returns success                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. USER NOW HAS ADMIN ROLE                                      │
│    {                                                            │
│      "_id": "507f...",                                          │
│      "name": "John Doe",                                        │
│      "email": "john@example.com",                               │
│      "role": "admin"  ← Updated role                            │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### ✅ Good Practices

1. **Default to least privilege**: All new users get "user" role
2. **Admin-only role changes**: Only authenticated admins can change roles
3. **Role validation**: Only "user" and "admin" roles allowed
4. **Audit trail**: Console logs role changes

### ⚠️ Additional Security (Optional)

Add these for production:

#### 1. Admin-Only Middleware

**File**: `ExpressServer/middleware/adminOnly.middleware.js`

```javascript
export function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
```

**Usage in routes**:
```javascript
import { adminOnly } from "../middleware/adminOnly.middleware.js";

router.put("/:id/role", verifyToken, adminOnly, updateUserRole);
```

#### 2. Prevent Self-Demotion

**In `updateUserRole` function**:
```javascript
// Prevent admin from demoting themselves
if (req.user.id === id && role === 'user') {
  return res.status(400).json({ 
    message: "Cannot demote yourself" 
  });
}
```

---

## Troubleshooting

### Issue 1: "Role is required" error on registration

**Cause**: Frontend still sending role field
**Solution**: 
- Check Register.tsx removed role from form
- Check authStore.ts removed role parameter
- Clear browser cache and restart frontend

### Issue 2: "Cannot PUT /api/users/:id/role"

**Cause**: Route not registered
**Solution**:
- Check users.js imported `updateUserRole`
- Check route is added: `router.put("/:id/role", ...)`
- Restart backend server

### Issue 3: Role update returns 401 Unauthorized

**Cause**: Not logged in or invalid token
**Solution**:
- Login first to get JWT token
- Copy token from browser cookies
- Add to Postman: `Cookie: token=your_token_here`

### Issue 4: Role update returns 404 User not found

**Cause**: Invalid user ID
**Solution**:
- Get correct user ID from GET /api/users
- Ensure ID is valid MongoDB ObjectId format
- Check user exists in database

---

## Quick Reference

### Registration (No Role Selection)
```
User fills: Name, Email
Backend assigns: role = "user"
```

### Role Update (Admin via Postman)
```
PUT /api/users/{user_id}/role
Body: { "role": "admin" }
Headers: Cookie: token=jwt_token
```

### Allowed Roles
```
- "user" (default)
- "admin" (assigned by admin)
```

---

## Summary

**What You Achieved**:
✅ Users register without selecting role
✅ All new users automatically get "user" role
✅ Admin can promote users to "admin" via Postman
✅ Role changes are validated and logged
✅ Secure role management system

**Files Modified**: 6 files
**New Endpoints**: 1 (PUT /api/users/:id/role)
**Security**: Default least privilege + admin-only role changes
