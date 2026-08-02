const express = require("express");
const path = require("path");
const Resource = require("../models/Resource");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const streamUpload = (buffer, ext) => {
  return new Promise((resolve, reject) => {
    const publicId = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    const stream = cloudinary.uploader.upload_stream(
      { folder: "studyhub_uploads", resource_type: "raw", public_id: publicId },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// @route   POST /api/resources  (upload new resource)
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const { title, courseCode, courseName, semester, type, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const result = await streamUpload(req.file.buffer, ext);

    const resource = await Resource.create({
      title,
      courseCode,
      courseName,
      semester,
      type,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      fileUrl: result.secure_url,
      originalFileName: req.file.originalname,
      uploader: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/resources  (browse with filters + search)
router.get("/", async (req, res) => {
  try {
    const { courseCode, semester, type, search, sort } = req.query;
    const filter = {};

    if (courseCode) filter.courseCode = courseCode.toUpperCase();
    if (semester) filter.semester = Number(semester);
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };

    let query = Resource.find(filter).populate("uploader", "name studentId");

    if (sort === "rating") {
      query = query.sort({ ratingSum: -1 });
    } else if (sort === "downloads") {
      query = query.sort({ downloadCount: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const resources = await query;
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/resources/:id/file  (redirect to Cloudinary file for download)
router.get("/:id/file", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    res.redirect(resource.fileUrl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/resources/:id
router.get("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate("uploader", "name studentId");
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/resources/:id/download  (track download count)
router.post("/:id/download", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json({ fileUrl: resource.fileUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/resources/:id/rate  (rate 1-5)
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { ratingSum: rating, ratingCount: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/resources/:id  (only uploader can edit)
router.put("/:id", protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this resource" });
    }

    const { title, courseCode, courseName, semester, type, tags } = req.body;

    if (title !== undefined) resource.title = title;
    if (courseCode !== undefined) resource.courseCode = courseCode;
    if (courseName !== undefined) resource.courseName = courseName;
    if (semester !== undefined) resource.semester = semester;
    if (type !== undefined) resource.type = type;
    if (tags !== undefined) resource.tags = tags.split(",").map((t) => t.trim());

    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/resources/:id  (only uploader or admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.uploader.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this resource" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;