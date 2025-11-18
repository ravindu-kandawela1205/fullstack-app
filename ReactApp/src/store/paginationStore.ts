import { create } from 'zustand';

interface PaginationState {
  products: {
    data: any[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    loading: boolean;
  };
  users: {
    data: any[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    loading: boolean;
  };
  fetchProducts: (page: number) => Promise<void>;
  fetchUsers: (page: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const BASE_URL = 'http://localhost:8000';

export const usePaginationStore = create<PaginationState>((set, get) => ({
  products: {
    data: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    loading: false
  },
  users: {
    data: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    loading: false
  },
  
  fetchProducts: async (page: number) => {
    set(state => ({ products: { ...state.products, loading: true } }));
    
    try {
      const response = await fetch(`${BASE_URL}/api/products?page=${page}`);
      const data = await response.json();
      
      set({
        products: {
          data: data.products,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems,
          loading: false
        }
      });
    } catch (error) {
      set(state => ({ products: { ...state.products, loading: false } }));
    }
  },
  
  fetchUsers: async (page: number) => {
    set(state => ({ users: { ...state.users, loading: true } }));
    
    try {
      const response = await fetch(`${BASE_URL}/api/users?page=${page}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      set({
        users: {
          data: data.users,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems,
          loading: false
        }
      });
    } catch (error) {
      set(state => ({ users: { ...state.users, loading: false } }));
    }
  },
  
  deleteProduct: async (id: string) => {
    try {
      await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const { products } = get();
      const newData = products.data.filter(item => item._id !== id);
      
      if (newData.length === 0 && products.currentPage > 1) {
        get().fetchProducts(products.currentPage - 1);
      } else {
        get().fetchProducts(products.currentPage);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  },
  
  deleteUser: async (id: string) => {
    try {
      await fetch(`${BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const { users } = get();
      const newData = users.data.filter(item => item._id !== id);
      
      if (newData.length === 0 && users.currentPage > 1) {
        get().fetchUsers(users.currentPage - 1);
      } else {
        get().fetchUsers(users.currentPage);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }
}));