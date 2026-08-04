const multer = require("multer");
const path = require("path");

const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".png"];

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
];
const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".png", ".xlsx", ".xls"];

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExt = allowedTypes.includes(ext);
  const validMime = allowedMimeTypes.includes(file.mimetype);

  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Allowed: " + allowedTypes.join(", ")));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

module.exports = upload;