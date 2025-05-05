const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // For creating JWT tokens
require("dotenv").config(); // Make sure to load the environment variables

// User registration route
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = new User({ username, email, password });

  // Save user to the database
  try {
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.authenticate(email, password, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ token });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
