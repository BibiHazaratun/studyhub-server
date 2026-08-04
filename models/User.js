
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{16}$/, "Student ID must be exactly 16 digits"],
    },
    department: {
      type: String,
      default: "CSE",
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
   role: {
      type: String,
      enum: ["student", "moderator", "admin"],
      default: "student",
    },
    banned: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Number,
      default: 0, // for leaderboard/gamification later
    },

  },
  resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
