const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { sendResetEmail } = require("../config/email");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, studentId, semester } = req.body;

    if (!name || !email || !password || !studentId || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      return res.status(400).json({ message: "User with this email or student ID already exists" });
    }

    const user = await User.create({ name, email, password, studentId, semester });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      semester: user.semester,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.banned) {
      return res.status(403).json({ message: "Your account has been banned. Contact admin for details." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      semester: user.semester,
      role: user.role,
      points: user.points,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendResetEmail(user.email, resetLink);

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    
    

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;