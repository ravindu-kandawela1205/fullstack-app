# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This guide shows how to implement role-based access control in your full-stack app, allowing different views and permissions for `admin` and `user` roles.

## Files Changed

### Backend Files

#### 1. `ExpressServer/models/authuser.js`
```js
role: {
  type: String,
  default: "user" // every new user is normal user
},
```
**What changed:** Added role field with default value "user"

#### 2. `ExpressServer/validators/auth.schema.js`
```js
export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().optional(), // Added role validation
});
```
**What changed:** Added role field to registration validation

#### 3. `ExpressServer/controllers/auth.controller.js`
```js
// In register function
const user = await User.create({ name: parsed.name, email: parsed.email, passwordHash, role: parsed.role });
const token = signToken({ sub: user._id, email: user.email, role: user.role });
res.status(201).json({
  user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage, role: user.role },
  token,
});

// In login function
const token = signToken({ sub: user._id, email: user.email, role: user.role });
res.json({
  user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage, role: user.role },
  token,
});

// In me function
res.json({ 
  user: { 
    id: user._id, 
    name: user.name, 
    email: user.email,
    profileImage: user.profileImage,
    role: user.role
  }
});
```
**What changed:** Added role to JWT token and all API responses

### Frontend Files

#### 4. `ReactApp/src/store/authStore.ts`
```js
// Updated User type
type User = { id: string; name: string; email: string; profileImage?: string; role?: string } | null;

// Updated register function
register: async (name, email, password, role = "user") => {
  await request(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify({ name, email, password, role }) }
  );
},

// Updated API response types
const res = await request<{ user: { id: string; name: string; email: string; role: string } }>(
```
**What changed:** Added role to User type, register function, and API response types

#### 5. `ReactApp/src/pages/Register.tsx`
```js
// Updated schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.string().min(1, 'Please select a role'), // Added role
});

// Updated default values
defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'user' },

// Updated onSubmit
await registerUser(data.name, data.email, data.password, data.role);

// Added role dropdown
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
**What changed:** Added role field to form schema, default values, and UI

#### 6. `ReactApp/src/components/layout/Sidebar.tsx`
```js
// Added adminOnly flag to menu items
const menuItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.USERS_LIST, label: "Products", icon: Users, adminOnly: true },
  { path: ROUTES.LOCAL_USERS, label: "Local Users", icon: UserCog },
];

// Filter menu items based on role
{menuItems.filter(item => !item.adminOnly || user?.role === 'admin').map((item) => (
```
**What changed:** Added role-based filtering for menu items

## Role-Based Implementation Patterns

### 1. Simple Conditional Rendering
```jsx
import { useAuth } from '../store/authStore';

function MyComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      {user?.role === 'admin' ? (
        <div>Admin Content</div>
      ) : (
        <div>User Content</div>
      )}
    </div>
  );
}
```

### 2. Admin-Only Content
```jsx
{user?.role === 'admin' && (
  <button>Delete User (Admin Only)</button>
)}
```

### 3. Multiple Role Checks
```jsx
{(user?.role === 'admin' || user?.role === 'moderator') && (
  <div>Admin or Moderator Content</div>
)}
```

### 4. Array Map with Role Filtering

#### Method 1: Filter Before Map
```jsx
const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Users", path: "/users", adminOnly: true },
  { name: "Products", path: "/products", adminOnly: true },
  { name: "Profile", path: "/profile" }
];

// Filter items based on role, then map
{menuItems
  .filter(item => !item.adminOnly || user?.role === 'admin')
  .map(item => (
    <NavLink key={item.path} to={item.path}>
      {item.name}
    </NavLink>
  ))
}
```

#### Method 2: Conditional Rendering Inside Map
```jsx
{menuItems.map(item => {
  // Skip admin-only items for non-admin users
  if (item.adminOnly && user?.role !== 'admin') {
    return null;
  }
  
  return (
    <NavLink key={item.path} to={item.path}>
      {item.name}
    </NavLink>
  );
})}
```

#### Method 3: Role-Based Styling
```jsx
{menuItems.map(item => (
  <NavLink 
    key={item.path} 
    to={item.path}
    className={item.adminOnly && user?.role !== 'admin' ? 'hidden' : 'block'}
  >
    {item.name}
  </NavLink>
))}
```

### 5. Complex Role-Based Components

#### Dashboard Cards Example
```jsx
const dashboardCards = [
  { title: "Total Users", value: usersCount, roles: ['admin', 'user'] },
  { title: "Products", value: productsCount, roles: ['admin'] },
  { title: "Revenue", value: revenue, roles: ['admin'] },
  { title: "My Orders", value: myOrders, roles: ['user'] }
];

return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {dashboardCards
      .filter(card => card.roles.includes(user?.role))
      .map(card => (
        <div key={card.title} className="bg-white p-6 rounded-lg shadow">
          <h3>{card.title}</h3>
          <p>{card.value}</p>
        </div>
      ))
    }
  </div>
);
```

#### Table Actions Example
```jsx
const users = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" }
];

return (
  <table>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>
            {/* Show edit for all users */}
            <button>Edit</button>
            
            {/* Show delete only for admins */}
            {currentUser?.role === 'admin' && (
              <button>Delete</button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

## Custom Hook for Role Checking

Create a custom hook for cleaner role checking:

```jsx
// hooks/useRole.js
import { useAuth } from '../store/authStore';

export function useRole() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role)
  };
}

// Usage in components
import { useRole } from '../hooks/useRole';

function MyComponent() {
  const { isAdmin, hasAnyRole } = useRole();
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {hasAnyRole(['admin', 'moderator']) && <ModeratorTools />}
    </div>
  );
}
```

## Security Notes

1. **Frontend role checks are for UI only** - Always validate permissions on the backend
2. **JWT contains role** - Role is embedded in the token for quick access
3. **Backend validation** - Always check user role in API endpoints before allowing actions
4. **Route protection** - Combine with route guards for complete protection

## Testing Role-Based Features

1. Register as admin: Select "Admin" role during registration
2. Register as user: Select "User" role during registration  
3. Login with different roles to see different UI elements
4. Check sidebar navigation changes based on role
5. Verify dashboard content varies by role