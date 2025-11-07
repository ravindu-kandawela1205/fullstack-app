import axiosInstance from "../../lib/axiosInstance";

export interface User {
  _id?: string;
  firstname: string;
  lastname: string;
  age: number;
  gender: string;
  email: string;
  birthdate: string;
}

export const usersAPI = {
  getAll: () => axiosInstance.get<User[]>("/api/users"),
  getById: (id: string) => axiosInstance.get<User>(`/api/users/${id}`),
  create: (user: Omit<User, "_id">) => axiosInstance.post<User>("/api/users", user),
  update: (id: string, user: Partial<User>) => axiosInstance.put<User>(`/api/users/${id}`, user),
  delete: (id: string) => axiosInstance.delete(`/api/users/${id}`)
};