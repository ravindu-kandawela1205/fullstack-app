// Put your backend base url here or use Vite env
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:7000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // VERY IMPORTANT for httpOnly cookie
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: { id: string; name: string; email: string } }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: { id: string; name: string; email: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () =>
    request<{ user: { id: string; name: string; email: string } }>("/api/auth/me"),

  logout: () => request<{ message: string }>("/api/auth/logout", { method: "POST" }),
};
