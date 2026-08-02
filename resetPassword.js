const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const NEW_PASSWORD = "Test1234";

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
  const result = await User.updateOne(
    { email: "test@puc.edu.bd" },
    { $set: { password: hashed } }
  );
  console.log("Password updated:", result);
  mongoose.disconnect();
});