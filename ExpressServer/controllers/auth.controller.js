import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/authuser.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  try {
    const parsed = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: parsed.email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await User.create({ name: parsed.name, email: parsed.email, passwordHash });

    const token = signToken({ sub: user._id, email: user.email });
    setAuthCookie(res, token);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token, // if you prefer cookie-only, you can omit this
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ sub: user._id, email: user.email });
    setAuthCookie(res, token);

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  // req.user is set by auth middleware
  res.json({ user: req.user });
}

export function logout(_req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" });
  res.json({ message: "Logged out" });
}
