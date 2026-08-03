const express = require("express");
const User = require("../models/User");
const { protect, adminOnly, staffOnly } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/users  (admin + moderator — list all users)
router.get("/", protect, staffOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/users/:id/ban  (admin + moderator — but only on students)
router.put("/:id/ban", protect, staffOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    if (req.user.role === "moderator" && user.role !== "student") {
      return res.status(403).json({ message: "Moderators can only ban students" });
    }

    user.banned = !user.banned;
    await user.save();

    res.json({ message: user.banned ? "User banned" : "User unbanned", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/users/:id/reset-password  (admin + moderator — but only on students)
router.put("/:id/reset-password", protect, staffOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.user.role === "moderator" && user.role !== "student") {
      return res.status(403).json({ message: "Moderators can only reset student passwords" });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successfully", newPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/users/:id/role  (admin only — promote/demote)
router.put("/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    user.role = role;
    await user.save();

    res.json({ message: `Role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;