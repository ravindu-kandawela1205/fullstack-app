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
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  try {
    console.log("Registration attempt:", req.body);
    const parsed = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: parsed.email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    console.log("Creating user with data:", { name: parsed.name, email: parsed.email });
    
    const user = await User.create({ name: parsed.name, email: parsed.email, passwordHash });
    console.log("User created successfully:", user._id);

    const token = signToken({ sub: user._id, email: user.email });
    setAuthCookie(res, token);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage },
      token,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    console.log("Login attempt:", req.body.email);
    const parsed = loginSchema.parse(req.body);
    
    const user = await User.findOne({ email: parsed.email });
    if (!user) {
      console.log("User not found:", parsed.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("User found:", user.email);
    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) {
      console.log("Password mismatch for:", parsed.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Login successful for:", user.email);
    const token = signToken({ sub: user._id, email: user.email });
    setAuthCookie(res, token);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage },
      token,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid input", issues: err.issues });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, profileImage } = req.body;
    const userId = req.user.id;

    console.log('Update profile request:', { userId, name, imageSize: profileImage ? profileImage.length : 0 });

    const updateData = { name };
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-passwordHash' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Profile updated successfully for user:', updatedUser.email);

    res.json({
      user: { 
        id: updatedUser._id, 
        name: updatedUser.name, 
        email: updatedUser.email,
        profileImage: updatedUser.profileImage
      }
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log("Password change attempt for user:", userId);
    
    const user = await User.findById(userId);
    console.log("Current password hash:", user.passwordHash.substring(0, 20) + "...");
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      console.log("Current password validation failed");
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    console.log("Current password validated, hashing new password");
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    console.log("New password hash:", newPasswordHash.substring(0, 20) + "...");
    
    // Update password directly
    user.passwordHash = newPasswordHash;
    await user.save();
    
    // Verify the update worked
    const verifyUser = await User.findById(userId);
    console.log("Verified password hash after update:", verifyUser.passwordHash.substring(0, 20) + "...");
    
    // Test new password works
    const testNewPassword = await bcrypt.compare(newPassword, verifyUser.passwordHash);
    console.log("New password verification:", testNewPassword);
    
    console.log("Password updated successfully for user:", user.email);

    // Clear auth cookie to logout user
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" });

    res.json({ 
      message: "Password updated successfully. Please login again.",
      logout: true
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export function logout(_req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" });
  res.json({ message: "Logged out" });
}
