const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2,4}-\d{3}$/, "Course code must match format like CSE-201"],
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    type: {
      type: String,
      enum: ["notes", "slides", "question", "lab"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    originalFileName: String,
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String, trim: true }],
    ratingSum: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual for average rating
resourceSchema.virtual("averageRating").get(function () {
  return this.ratingCount === 0 ? 0 : (this.ratingSum / this.ratingCount).toFixed(1);
});

resourceSchema.set("toJSON", { virtuals: true });
resourceSchema.set("toObject", { virtuals: true });

// Index for search/filter performance
resourceSchema.index({ courseCode: 1, semester: 1 });
resourceSchema.index({ title: "text", courseName: "text", tags: "text" });

module.exports = mongoose.model("Resource", resourceSchema);
