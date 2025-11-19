// JWT utility functions for client-side token handling

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Decode JWT token (client-side only - for non-sensitive data)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

// Get user data from JWT token
export function getUserFromToken(token: string): { id: string; name: string; email: string; role: string } | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role
  };
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
}