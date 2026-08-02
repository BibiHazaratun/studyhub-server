const multer = require("multer");
const path = require("path");

const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".png"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Allowed: " + allowedTypes.join(", ")));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max,
});

module.exports = upload;