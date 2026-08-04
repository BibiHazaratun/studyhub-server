require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const resourceRoutes = require("./routes/resources");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("StudyHub API is running - PUC CSE Edition");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Known/expected validation errors — safe to show to the user
  if (err.name === "ValidationError" || err.message?.includes("not allowed")) {
    return res.status(400).json({ message: err.message });
  }

  // Unexpected/internal errors — hide details from the user
  res.status(500).json({ message: "Something went wrong on the server. Please try again." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
