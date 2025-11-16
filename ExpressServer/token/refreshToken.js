import jwt from "jsonwebtoken";
import { signToken, setAuthCookie } from "./generateToken.js";

export function refreshToken(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate new token with same payload
    const newToken = signToken({ sub: payload.sub, email: payload.email });
    setAuthCookie(res, newToken);

    res.json({ 
      message: "Token refreshed successfully",
      token: newToken 
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}