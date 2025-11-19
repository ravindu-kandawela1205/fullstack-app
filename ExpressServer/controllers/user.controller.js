import User from "../models/user.js";

// GET /api/users - Paginated users
export async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// POST /api/users
export async function createUser(req, res) {
  try {
    const created = await User.create(req.body);
    res.status(201).json({ data: created, message: "User added successfully!" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
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
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.json({ ok: true, id: req.params.id, message: "User deleted successfully!" });
}