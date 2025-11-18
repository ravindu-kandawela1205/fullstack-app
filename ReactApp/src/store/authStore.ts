// src/store/authStore.ts
import { create } from "zustand";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data as T;
}

type User = { id: string; name: string; email: string; profileImage?: string; role?: string } | null;

type AuthState = {
  user: User;
  loading: boolean;
  initialized: boolean;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (name: string, profileImage?: string) => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  register: async (name, email, password, role = "user") => {
    set({ loading: true });
    try {
      await request(
        "/api/auth/register",
        { method: "POST", body: JSON.stringify({ name, email, password, role }) }
      );
      set({ loading: false });
    } catch (e: any) {
      set({ loading: false });
      throw e;
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await request<{ user: { id: string; name: string; email: string; role: string } }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      set({ user: res.user, loading: false });
    } catch (e: any) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await request("/api/auth/logout", { method: "POST" });
      set({ user: null });
    } catch (e) {
      set({ user: null }); // Clear user even if request fails
    }
  },

  checkAuth: async () => {
    try {
      const res = await request<{ user: { id: string; name: string; email: string; role: string } }>("/api/auth/me");
      set({ user: res.user, initialized: true });
    } catch (e) {
      set({ user: null, initialized: true });
    }
  },

  updateProfile: async (name, profileImage) => {
    try {
      const body: any = { name };
      if (profileImage !== undefined) {
        body.profileImage = profileImage;
      }
      const res = await request<{ user: { id: string; name: string; email: string; profileImage?: string } }>(
        "/api/auth/profile",
        { method: "PUT", body: JSON.stringify(body) }
      );
      set({ user: res.user });
    } catch (e: any) {
      throw e;
    }
  },
}));
