const path = require("path");

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