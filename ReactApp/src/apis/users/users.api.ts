import axiosInstance from "../../lib/axiosInstance";

export interface User {
  _id?: string;
  firstname: string;
  lastname: string;
  age: number;
  gender: string;
  email: string;
  birthdate: string;
  image?: string;
}

export async function getUsers(page = 1, limit = 10): Promise<{ data: User[]; total: number }> {
  const res = await axiosInstance.get(`/api/users?page=${page}&limit=${limit}`);
  return {
    data: res.data.users || [],
    total: res.data.pagination?.totalItems || 0,
  };
}

export async function createUser(userData: Omit<User, "_id">) {
  const res = await axiosInstance.post("/api/users", userData);
  return res.data;
}

export async function updateUser(id: string, userData: Partial<User>) {
  const res = await axiosInstance.put(`/api/users/${id}`, userData);
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await axiosInstance.delete(`/api/users/${id}`);
  return res.data;
}