const express = require("express");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/users  (admin only — list all users)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/users/:id/ban  (admin only — toggle ban status)
router.put("/:id/ban", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    user.banned = !user.banned;
    await user.save();

    res.json({ message: user.banned ? "User banned" : "User unbanned", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// @route   PUT /api/users/:id/reset-password  (admin only)
router.put("/:id/reset-password", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPassword = Math.random().toString(36).slice(-8);
    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: "Password reset successfully", newPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;