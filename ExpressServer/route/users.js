import { Router } from "express";
import User from "../models/user.js";

const router = Router();

// GET /api/users
router.get("/", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const created = await User.create(req.body);
    res.status(201).json({ data: created, message: "User added successfully!" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ data: updated, message: "User updated successfully!" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.json({ ok: true, id: req.params.id, message: "User deleted successfully!" });
});

export default router;
