const express = require("express");
const Comment = require("../models/Comment");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/comments/:resourceId
router.get("/:resourceId", async (req, res) => {
  try {
    const comments = await Comment.find({ resource: req.params.resourceId })
      .populate("user", "name studentId")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/comments/:resourceId
router.post("/:resourceId", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const comment = await Comment.create({
      resource: req.params.resourceId,
      user: req.user._id,
      text,
    });

    const populated = await comment.populate("user", "name studentId");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/comments/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
