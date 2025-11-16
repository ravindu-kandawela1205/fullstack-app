import { User } from "../models/authuser.js";
import { verifyToken } from "../token/verifyToken.js";

export async function requireAuth(req, res, next) {
  try {
    // Try cookie first, then Bearer header
    const tokenFromCookie = req.cookies?.token;
    const auth = req.headers.authorization || "";
    const tokenFromHeader = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // TOKEN FOLDER: verifyToken.js - Verify JWT token
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).select("_id name email profileImage");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = { id: user._id.toString(), name: user.name, email: user.email, profileImage: user.profileImage };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
