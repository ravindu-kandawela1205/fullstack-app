import { create } from "zustand";
import { usersAPI, User } from "../apis/users/users.api";

type State = {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (u: Omit<User, "_id">) => Promise<string>;
  updateUser: (id: string, u: Partial<User>) => Promise<string>;
  removeUser: (id: string) => Promise<string>;
};

export const useLocalUsers = create<State>()((set, get) => ({
  users: [],
  loading: false,
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await usersAPI.getAll();
      set({ users: response.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ loading: false });
    }
  },
  
  addUser: async (u) => {
    try {
      const response = await usersAPI.create(u);
      set((s) => ({ users: [response.data.data, ...s.users] }));
      return response.data.message;
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  },
  
  updateUser: async (id, u) => {
    try {
      const response = await usersAPI.update(id, u);
      set((s) => ({
        users: s.users.map((x) => (x._id === id ? response.data.data : x))
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
      set((s) => ({ users: s.users.filter((x) => x._id !== id) }));
      return response.data.message;
    } catch (error) {
      console.error("Failed to remove user:", error);
      throw error;
    }
  }
}));
