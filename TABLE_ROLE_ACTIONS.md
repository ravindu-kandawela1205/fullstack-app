# Table Role-Based Action Buttons Guide

## Overview
This guide shows how to hide/show table action buttons based on user roles in different table implementations.

## Basic Table with Role-Based Actions

### Simple Table Example
```jsx
import { useAuth } from '../store/authStore';

function UsersTable() {
  const { user } = useAuth();
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin" }
  ];

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(userData => (
          <tr key={userData.id}>
            <td>{userData.name}</td>
            <td>{userData.email}</td>
            <td>{userData.role}</td>
            <td className="flex gap-2">
              {/* View - Everyone can see */}
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                View
              </button>
              
              {/* Edit - Only admins or own profile */}
              {(user?.role === 'admin' || user?.id === userData.id) && (
                <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
              )}
              
              {/* Delete - Only admins */}
              {user?.role === 'admin' && (
                <button className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              )}
              
              {/* Promote - Only admins, only for users */}
              {user?.role === 'admin' && userData.role === 'user' && (
                <button className="bg-green-500 text-white px-3 py-1 rounded">
                  Promote
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Advanced Table with Action Configuration

### Method 1: Action Configuration Array
```jsx
function ProductsTable() {
  const { user } = useAuth();
  const products = [
    { id: 1, name: "Laptop", price: 999, createdBy: "admin1" },
    { id: 2, name: "Phone", price: 599, createdBy: "user1" }
  ];

  // Define actions with role requirements
  const getActions = (product) => [
    {
      label: "View",
      color: "bg-blue-500",
      show: true, // Everyone can view
      onClick: () => viewProduct(product.id)
    },
    {
      label: "Edit",
      color: "bg-yellow-500",
      show: user?.role === 'admin' || product.createdBy === user?.id,
      onClick: () => editProduct(product.id)
    },
    {
      label: "Delete",
      color: "bg-red-500",
      show: user?.role === 'admin',
      onClick: () => deleteProduct(product.id)
    },
    {
      label: "Duplicate",
      color: "bg-purple-500",
      show: user?.role === 'admin',
      onClick: () => duplicateProduct(product.id)
    }
  ];

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>${product.price}</td>
            <td className="flex gap-2">
              {getActions(product)
                .filter(action => action.show)
                .map(action => (
                  <button
                    key={action.label}
                    className={`${action.color} text-white px-3 py-1 rounded`}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Method 2: Role-Based Action Components
```jsx
function OrdersTable() {
  const { user } = useAuth();
  const orders = [
    { id: 1, customer: "John", status: "pending", total: 150 },
    { id: 2, customer: "Jane", status: "completed", total: 200 }
  ];

  // Action components based on role
  const AdminActions = ({ order }) => (
    <>
      <button className="bg-green-500 text-white px-3 py-1 rounded">
        Approve
      </button>
      <button className="bg-red-500 text-white px-3 py-1 rounded">
        Cancel
      </button>
      <button className="bg-purple-500 text-white px-3 py-1 rounded">
        Refund
      </button>
    </>
  );

  const UserActions = ({ order }) => (
    <>
      <button className="bg-blue-500 text-white px-3 py-1 rounded">
        View Details
      </button>
      {order.status === 'pending' && (
        <button className="bg-yellow-500 text-white px-3 py-1 rounded">
          Modify
        </button>
      )}
    </>
  );

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Status</th>
          <th>Total</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>#{order.id}</td>
            <td>{order.customer}</td>
            <td>{order.status}</td>
            <td>${order.total}</td>
            <td className="flex gap-2">
              {user?.role === 'admin' ? (
                <AdminActions order={order} />
              ) : (
                <UserActions order={order} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Data Table with Role-Based Actions

### Using React Table / TanStack Table
```jsx
import { useAuth } from '../store/authStore';
import { useMemo } from 'react';

function DataTable() {
  const { user } = useAuth();
  const data = [
    { id: 1, name: "Product 1", category: "Electronics", price: 299 },
    { id: 2, name: "Product 2", category: "Clothing", price: 49 }
  ];

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'price', header: 'Price' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;
        
        return (
          <div className="flex gap-2">
            {/* Always show view */}
            <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
              View
            </button>
            
            {/* Admin only actions */}
            {user?.role === 'admin' && (
              <>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                  Edit
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                  Delete
                </button>
              </>
            )}
            
            {/* Conditional actions based on data */}
            {user?.role === 'admin' && product.category === 'Electronics' && (
              <button className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                Feature
              </button>
            )}
          </div>
        );
      }
    }
  ], [user?.role]);

  // Use with your preferred table library
  return <YourTableComponent columns={columns} data={data} />;
}
```

## Custom Hook for Table Actions

### useTableActions Hook
```jsx
// hooks/useTableActions.js
import { useAuth } from '../store/authStore';

export function useTableActions() {
  const { user } = useAuth();

  const getActionPermissions = (item, itemType = 'general') => {
    const permissions = {
      canView: true, // Everyone can view
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canCreate: false
    };

    switch (user?.role) {
      case 'admin':
        permissions.canEdit = true;
        permissions.canDelete = true;
        permissions.canApprove = true;
        permissions.canCreate = true;
        break;
        
      case 'moderator':
        permissions.canEdit = true;
        permissions.canApprove = true;
        break;
        
      case 'user':
        // Users can only edit their own items
        permissions.canEdit = item?.createdBy === user?.id;
        break;
        
      default:
        permissions.canView = false;
    }

    return permissions;
  };

  const renderActionButtons = (item, itemType = 'general') => {
    const permissions = getActionPermissions(item, itemType);
    
    return (
      <div className="flex gap-2">
        {permissions.canView && (
          <button className="bg-blue-500 text-white px-3 py-1 rounded">
            View
          </button>
        )}
        
        {permissions.canEdit && (
          <button className="bg-yellow-500 text-white px-3 py-1 rounded">
            Edit
          </button>
        )}
        
        {permissions.canDelete && (
          <button className="bg-red-500 text-white px-3 py-1 rounded">
            Delete
          </button>
        )}
        
        {permissions.canApprove && (
          <button className="bg-green-500 text-white px-3 py-1 rounded">
            Approve
          </button>
        )}
      </div>
    );
  };

  return { getActionPermissions, renderActionButtons };
}

// Usage in component
function MyTable() {
  const { renderActionButtons } = useTableActions();
  const items = [...]; // your data

  return (
    <table>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{renderActionButtons(item, 'product')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Dropdown Actions Menu

### Role-Based Dropdown
```jsx
import { useState } from 'react';
import { useAuth } from '../store/authStore';

function ActionDropdown({ item }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'View Details', roles: ['admin', 'user'], action: () => viewItem(item.id) },
    { label: 'Edit', roles: ['admin'], action: () => editItem(item.id) },
    { label: 'Delete', roles: ['admin'], action: () => deleteItem(item.id) },
    { label: 'Archive', roles: ['admin'], action: () => archiveItem(item.id) },
    { label: 'Share', roles: ['admin', 'user'], action: () => shareItem(item.id) }
  ];

  const allowedActions = actions.filter(action => 
    action.roles.includes(user?.role)
  );

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-500 text-white px-3 py-1 rounded"
      >
        Actions ▼
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
          {allowedActions.map(action => (
            <button
              key={action.label}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Usage in table
function TableWithDropdown() {
  const items = [...]; // your data

  return (
    <table>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>
              <ActionDropdown item={item} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Bulk Actions with Role Check

### Bulk Operations
```jsx
function BulkActionsTable() {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const items = [...]; // your data

  const bulkActions = [
    { 
      label: 'Delete Selected', 
      roles: ['admin'], 
      action: () => deleteBulk(selectedItems),
      color: 'bg-red-500'
    },
    { 
      label: 'Archive Selected', 
      roles: ['admin'], 
      action: () => archiveBulk(selectedItems),
      color: 'bg-yellow-500'
    },
    { 
      label: 'Export Selected', 
      roles: ['admin', 'user'], 
      action: () => exportBulk(selectedItems),
      color: 'bg-blue-500'
    }
  ];

  const allowedBulkActions = bulkActions.filter(action => 
    action.roles.includes(user?.role)
  );

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded flex gap-2">
          <span>{selectedItems.length} items selected</span>
          {allowedBulkActions.map(action => (
            <button
              key={action.label}
              onClick={action.action}
              className={`${action.color} text-white px-3 py-1 rounded`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(items.map(item => item.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
              />
            </th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                <input 
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, item.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== item.id));
                    }
                  }}
                />
              </td>
              <td>{item.name}</td>
              <td>
                {/* Individual actions based on role */}
                {user?.role === 'admin' && (
                  <button className="bg-red-500 text-white px-2 py-1 rounded">
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Summary

### Key Patterns:
1. **Simple Conditional**: `{user?.role === 'admin' && <Button />}`
2. **Filter Array**: `actions.filter(action => action.roles.includes(user?.role))`
3. **Component Switching**: `{user?.role === 'admin' ? <AdminActions /> : <UserActions />}`
4. **Permission Objects**: Use hooks to return permission objects
5. **Dropdown Menus**: Filter dropdown options based on role
6. **Bulk Actions**: Show bulk operation buttons based on role

### Best Practices:
- Always validate permissions on the backend
- Use consistent role checking patterns
- Consider using custom hooks for complex permission logic
- Test with different user roles
- Handle edge cases (no role, undefined user)