import { create } from "zustand";
import { usersAPI, User } from "../apis/users/users.api";

type State = {
  users: User[];
  total: number;
  loading: boolean;
  fetchUsers: (page?: number, pageSize?: number) => Promise<void>;
  addUser: (u: Omit<User, "_id">) => Promise<string>;
  updateUser: (id: string, u: Partial<User>) => Promise<string>;
  removeUser: (id: string) => Promise<string>;
};

export const useLocalUsers = create<State>()((set, get) => ({
  users: [],
  total: 0,
  loading: false,
  
  fetchUsers: async (page = 1, pageSize = 10) => {
    set({ loading: true });
    try {
      const response = await usersAPI.getAll(page, pageSize);
      // Backend returns { users: [...], pagination: {...} }
      set({ 
        users: response.data.users || [], 
        total: response.data.pagination?.totalItems || 0,
        loading: false 
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ loading: false });
    }
  },
  
  addUser: async (u) => {
    try {
      const response = await usersAPI.create(u);
      // Refresh the current page after adding
      await get().fetchUsers();
      return response.data.message;
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  },
  
  updateUser: async (id, u) => {
    try {
      const response = await usersAPI.update(id, u);
      // Update the user in current state
      set((s) => ({
        users: Array.isArray(s.users) ? s.users.map((x) => (x._id === id ? response.data.data : x)) : []
      }));
      return response.data.message;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },
  
  removeUser: async (id) => {
    try {
      const response = await usersAPI.delete(id);
      // Refresh the current page after deleting
      await get().fetchUsers();
      return response.data.message;
    } catch (error) {
      console.error("Failed to remove user:", error);
      throw error;
    }
  }
}));