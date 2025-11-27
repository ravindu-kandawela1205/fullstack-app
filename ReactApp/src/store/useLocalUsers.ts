import { create } from "zustand";
import { User, getUsers, createUser, updateUser, deleteUser } from "../apis/users/users.api";

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
      const response = await getUsers(page, pageSize);
      set({ 
        users: response.data || [], 
        total: response.total || 0,
        loading: false 
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ loading: false });
    }
  },
  
  addUser: async (u) => {
    try {
      const response = await createUser(u);
      await get().fetchUsers();
      return response.message;
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  },
  
  updateUser: async (id, u) => {
    try {
      const response = await updateUser(id, u);
      set((s) => ({
        users: Array.isArray(s.users) ? s.users.map((x) => (x._id === id ? response.data : x)) : []
      }));
      return response.message;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },
  
  removeUser: async (id) => {
    try {
      const response = await deleteUser(id);
      await get().fetchUsers();
      return response.message;
    } catch (error) {
      console.error("Failed to remove user:", error);
      throw error;
    }
  }
}));