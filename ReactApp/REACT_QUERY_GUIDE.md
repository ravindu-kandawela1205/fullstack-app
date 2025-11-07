# React Query + Zustand Guide

## What is React Query?
React Query manages **server state** (data from APIs) with automatic caching, refetching, and synchronization.

## What is Zustand?
Zustand manages **client state** (local app state like UI state, form data).

## How They Work Together

### React Query (Server State)
```tsx
// Fetch data from API
const { data, isLoading } = useUsersQuery(page, pageSize);
```

### Zustand (Client State)
```tsx
// Local state management
const { users, addUser } = useLocalUsers();
```

## Setup (Already Done)

### 1. main.tsx - QueryClientProvider wraps app
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1,                     // Retry failed requests once
      staleTime: 5 * 60 * 1000,    // Data fresh for 5 minutes
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 2. Create Query Hook
```tsx
// hooks/users/useUsersQuery.hook.ts
export function useUsersQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["users", page, pageSize], // Cache key
    queryFn: () => getUsers(page, pageSize), // Fetch function
  });
}
```

### 3. Use in Component
```tsx
const { data, isLoading, error, refetch } = useUsersQuery(page, pageSize);
```

## Benefits

### React Query
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Loading/error states
- ✅ Deduplication (no duplicate requests)
- ✅ Pagination support

### Zustand
- ✅ Simple local state
- ✅ No boilerplate
- ✅ Works outside React
- ✅ Perfect for UI state

## When to Use What?

**Use React Query for:**
- API data (users, posts, products)
- Server-side data that needs caching
- Data that can be refetched

**Use Zustand for:**
- UI state (modals, theme, sidebar)
- Form state
- Local-only data
- Client-side CRUD (like LocalUsers)

## Example: Mutations with React Query

```tsx
// Create mutation hook
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted!");
    },
  });
}

// Use in component
const deleteMutation = useDeleteUser();
deleteMutation.mutate(userId);
```

## Current Implementation

- **UsersTable**: Uses React Query (API data with caching)
- **LocalUsersTable**: Uses Zustand (local state management)
