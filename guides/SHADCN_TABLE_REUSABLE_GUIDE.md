# Shadcn Table - Complete Reusable Guide (A to Z)

## Overview
This guide explains how to create fully reusable tables using Shadcn UI and TanStack Table (React Table v8). You'll learn the architecture, components, and patterns used in your project.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Core Components](#2-core-components)
3. [Type Definitions](#3-type-definitions)
4. [Column Definitions](#4-column-definitions)
5. [DataTable Component](#5-datatable-component)
6. [Page Implementation](#6-page-implementation)
7. [Creating New Tables](#7-creating-new-tables)
8. [Advanced Features](#8-advanced-features)
9. [Best Practices](#9-best-practices)

---

## 1. Architecture Overview

### The 3-Layer Pattern

```
┌─────────────────────────────────────────┐
│  Page Component (ProductsTable.tsx)    │  ← Business Logic Layer
│  - State management                     │
│  - API calls                            │
│  - Event handlers                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DataTable Component (data-table.tsx)   │  ← Reusable Table Layer
│  - Table rendering                      │
│  - Pagination                           │
│  - Selection                            │
│  - Search                               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Column Definitions (columns.tsx)       │  ← Column Configuration Layer
│  - Column structure                     │
│  - Cell rendering                       │
│  - Actions                              │
└─────────────────────────────────────────┘
```

### File Structure
```
src/
├── tables/
│   ├── data-table.tsx          # Reusable table component
│   ├── columns.tsx              # Product columns
│   └── userColumns.tsx          # User columns
├── pages/
│   └── tables/
│       ├── ProductsTable.tsx    # Products page
│       └── LocalUsersTable.tsx  # Users page
├── types/
│   └── product.ts               # Type definitions
└── components/
    └── ui/
        ├── table.tsx            # Shadcn table primitives
        ├── checkbox.tsx         # Shadcn checkbox
        └── button.tsx           # Shadcn button
```

---

## 2. Core Components

### Shadcn UI Components (Primitives)

These are the base components from Shadcn:

```typescript
// components/ui/table.tsx
- Table          // Main table wrapper
- TableHeader    // Header section
- TableBody      // Body section
- TableRow       // Row wrapper
- TableHead      // Header cell
- TableCell      // Body cell
```

### TanStack Table (React Table v8)

The headless table library that powers the logic:

```typescript
import {
  ColumnDef,              // Type for column definitions
  flexRender,             // Renders cells/headers
  getCoreRowModel,        // Core table functionality
  useReactTable,          // Main hook
} from "@tanstack/react-table";
```

---

## 3. Type Definitions

### Step 1: Define Your Data Type

```typescript
// types/product.ts
export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  image?: string;
}
```

### Step 2: Define Generic Data Row Interface

```typescript
// tables/data-table.tsx
interface DataRow {
  id?: number;
  _id?: string;
}
```

This allows the table to work with any data that has an `id` or `_id` field.

---

## 4. Column Definitions

### Basic Column Structure

```typescript
// tables/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/types/product";

export const columns: ColumnDef<Product>[] = [
  // Columns go here
];
```

### Column Types

#### 1. Selection Column (Checkbox)
```typescript
{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
}
```

#### 2. Simple Text Column
```typescript
{
  accessorKey: "name",    // Field name from data
  header: "Name",         // Column header text
}
```

#### 3. Custom Cell Rendering
```typescript
{
  accessorKey: "price",
  header: "Price",
  cell: ({ row }) => `$${row.original.price}`,
}
```

#### 4. Image Column
```typescript
{
  accessorKey: "image",
  header: "Image",
  cell: ({ row }) => {
    const image = row.original.image;
    return image ? (
      <img src={image} alt="Product" className="w-12 h-12 object-cover rounded" />
    ) : (
      <div className="w-12 h-12 bg-gray-200 rounded">No image</div>
    );
  },
}
```

#### 5. Actions Column
```typescript
{
  id: "actions",
  header: () => <div className="text-right">Actions</div>,
  cell: ({ row, table }) => {
    const meta = table.options.meta as any;
    const product = row.original;
    
    return (
      <div className="flex justify-end gap-2">
        <Button onClick={() => meta?.onViewAction?.(product)}>
          View
        </Button>
        <Button onClick={() => meta?.onSecondaryAction?.(product)}>
          Edit
        </Button>
        <Button onClick={() => meta?.onRowAction?.(product)}>
          Delete
        </Button>
      </div>
    );
  },
  enableSorting: false,
  size: 120,
}
```

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique column identifier |
| `accessorKey` | string | Field name from data object |
| `header` | string \| function | Column header content |
| `cell` | function | Custom cell rendering |
| `enableSorting` | boolean | Enable/disable sorting |
| `enableHiding` | boolean | Enable/disable column hiding |
| `size` | number | Column width |

---

## 5. DataTable Component

### Component Props

```typescript
type DataTableProps<TData extends DataRow> = {
  // Required
  columns: ColumnDef<TData, any>[];
  data: TData[];
  selectedIds: Set<string | number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string | number>>>;
  
  // Optional - Pagination
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  
  // Optional - Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Optional - Actions
  onRowAction?: (row: TData) => void;          // Delete action
  onSecondaryAction?: (row: TData) => void;    // Edit action
  onViewAction?: (row: TData) => void;         // View action
  
  // Optional - UI
  loading?: boolean;
  title?: string;
};
```

### Key Features

#### 1. Selection Management
```typescript
// Page-level selection state
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// Check if row is selected
const isSelected = selectedIds.has(row._id);

// Toggle row selection
const toggleRow = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};
```

#### 2. Table Meta (Passing Actions)
```typescript
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  meta: {
    onRowAction,           // Delete
    onSecondaryAction,     // Edit
    onViewAction,          // View
  },
});
```

#### 3. Rendering Pattern
```typescript
<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 6. Page Implementation

### Complete Example: ProductsTable.tsx

```typescript
import * as React from 'react';
import { DataTable } from '@/tables/data-table';
import { columns } from '@/tables/columns';
import type { Product } from '@/types/product';

export default function ProductsTable() {
  // 1. State Management
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState('');
  
  // 2. Data Fetching
  const { data, isLoading, refetch } = useProductsQuery(page, pageSize);
  const rows = data?.data || [];
  
  // 3. Action Handlers
  const handleView = (product: Product) => {
    console.log('View:', product);
  };
  
  const handleEdit = (product: Product) => {
    console.log('Edit:', product);
  };
  
  const handleDelete = (product: Product) => {
    console.log('Delete:', product);
  };
  
  // 4. Render
  return (
    <DataTable
      columns={columns}
      data={rows}
      total={data?.total || 0}
      page={page}
      pageSize={pageSize}
      loading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search products..."
      selectedIds={selectedIds}
      setSelectedIds={setSelectedIds}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onRowAction={handleDelete}
      onSecondaryAction={handleEdit}
      onViewAction={handleView}
    />
  );
}
```

---

## 7. Creating New Tables

### Step-by-Step Guide

#### Step 1: Create Type Definition
```typescript
// types/order.ts
export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}
```

#### Step 2: Create Column Definitions
```typescript
// tables/orderColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order";

export const orderColumns: ColumnDef<Order>[] = [
  {
    id: "select",
    // ... selection column
  },
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "orderNumber",
    header: "Order #",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const colors = {
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
      };
      return (
        <span className={`px-2 py-1 rounded ${colors[status]}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <div className="flex justify-end gap-2">
          <Button onClick={() => meta?.onViewAction?.(row.original)}>
            View
          </Button>
          <Button onClick={() => meta?.onSecondaryAction?.(row.original)}>
            Edit
          </Button>
        </div>
      );
    },
  },
];
```

#### Step 3: Create Page Component
```typescript
// pages/tables/OrdersTable.tsx
import * as React from 'react';
import { DataTable } from '@/tables/data-table';
import { orderColumns } from '@/tables/orderColumns';
import type { Order } from '@/types/order';

export default function OrdersTable() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState('');
  
  // Fetch data (replace with your API)
  const { data, isLoading } = useOrdersQuery(page, pageSize);
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      
      <DataTable
        columns={orderColumns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onViewAction={(order) => console.log('View', order)}
        onSecondaryAction={(order) => console.log('Edit', order)}
      />
    </div>
  );
}
```

---

## 8. Advanced Features

### 1. Conditional Rendering in Columns

```typescript
{
  id: "actions",
  cell: ({ row, table }) => {
    const meta = table.options.meta as any;
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    
    return (
      <div className="flex gap-2">
        <Button onClick={() => meta?.onViewAction?.(row.original)}>
          View
        </Button>
        
        {/* Only show edit/delete for admins */}
        {isAdmin && (
          <>
            <Button onClick={() => meta?.onSecondaryAction?.(row.original)}>
              Edit
            </Button>
            <Button onClick={() => meta?.onRowAction?.(row.original)}>
              Delete
            </Button>
          </>
        )}
      </div>
    );
  },
}
```

### 2. Custom Cell Components

```typescript
// components/StatusBadge.tsx
export function StatusBadge({ status }: { status: string }) {
  const variants = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs ${variants[status]}`}>
      {status}
    </span>
  );
}

// In columns
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => <StatusBadge status={row.original.status} />,
}
```

### 3. Nested Data Access

```typescript
{
  accessorKey: "user.name",  // Access nested property
  header: "User Name",
  cell: ({ row }) => row.original.user?.name || "N/A",
}
```

### 4. Multiple Actions with Dropdown

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

{
  id: "actions",
  cell: ({ row, table }) => {
    const meta = table.options.meta as any;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">⋮</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => meta?.onViewAction?.(row.original)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => meta?.onSecondaryAction?.(row.original)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => meta?.onRowAction?.(row.original)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
}
```

### 5. Loading Skeleton

```typescript
// In DataTable component
{loading ? (
  Array.from({ length: pageSize }).map((_, i) => (
    <TableRow key={i}>
      {columns.map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ))
) : (
  // Normal rows
)}
```

---

## 9. Best Practices

### 1. Type Safety
```typescript
// ✅ Good: Strongly typed
const columns: ColumnDef<Product>[] = [...]

// ❌ Bad: Any type
const columns: any[] = [...]
```

### 2. Memoization
```typescript
// Memoize columns to prevent re-creation
const columns = React.useMemo<ColumnDef<Product>[]>(
  () => [
    // columns
  ],
  []
);
```

### 3. Separate Concerns
```
✅ columns.tsx       → Column definitions only
✅ data-table.tsx    → Reusable table logic
✅ ProductsTable.tsx → Business logic & state
```

### 4. Consistent Naming
```typescript
// Action naming convention
onRowAction        → Delete action
onSecondaryAction  → Edit action
onViewAction       → View action
```

### 5. Error Handling
```typescript
const { data, isLoading, error } = useProductsQuery(page, pageSize);

if (error) {
  return <div>Error loading data</div>;
}
```

### 6. Empty States
```typescript
{data.length === 0 ? (
  <TableRow>
    <TableCell colSpan={columns.length} className="text-center">
      No data available
    </TableCell>
  </TableRow>
) : (
  // Render rows
)}
```

### 7. Accessibility
```typescript
<Button
  onClick={handleClick}
  aria-label="Delete product"  // ✅ Add aria labels
>
  <TrashIcon />
</Button>
```

---

## Summary

### Key Concepts

1. **Separation of Concerns**: Columns, table logic, and page logic are separate
2. **Type Safety**: Use TypeScript for all data structures
3. **Reusability**: DataTable component works with any data type
4. **Flexibility**: Pass actions via meta, customize columns per table
5. **Performance**: Memoize columns and use proper React patterns

### File Checklist for New Table

- [ ] Create type definition (`types/yourType.ts`)
- [ ] Create column definitions (`tables/yourColumns.tsx`)
- [ ] Create page component (`pages/tables/YourTable.tsx`)
- [ ] Add API hook if needed (`hooks/useYourQuery.hook.ts`)
- [ ] Add route to navigation

### Quick Reference

```typescript
// Minimal table setup
<DataTable
  columns={columns}              // Required
  data={data}                    // Required
  selectedIds={selectedIds}      // Required
  setSelectedIds={setSelectedIds} // Required
  onRowAction={handleDelete}     // Optional
  onSecondaryAction={handleEdit} // Optional
  onViewAction={handleView}      // Optional
/>
```

You now have a complete understanding of how to create and use reusable Shadcn tables! 🎉
