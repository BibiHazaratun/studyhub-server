const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".png"];

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "studyhub_uploads",
      resource_type: "auto", // allows pdf/doc/ppt/images all
      public_id: Date.now() + "-" + Math.round(Math.random() * 1e9),
    };
  },
});

const fileFilter = (req, file, cb) => {
  const ext = require("path").extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Allowed: " + allowedTypes.join(", ")));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
});

module.exports = upload;