const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const cloudinaryModule = require("cloudinary");
const cloudinary = cloudinaryModule.v2;
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".png"];

const storage = cloudinaryStorage({
  cloudinary: cloudinaryModule,
  folder: "studyhub_uploads",
  resource_type: "raw",
  filename: (req, file, cb) => {
    cb(undefined, Date.now() + "-" + Math.round(Math.random() * 1e9));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Allowed: " + allowedTypes.join(", ")));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

module.exports = upload;