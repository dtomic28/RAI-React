const express = require("express");
const router = express.Router();
const Photo = require("../models/photoModel");
const Comment = require("../models/commentModel");
const authMiddleware = require("../middleware/authMiddleware"); // Import the authentication middleware
const multer = require("multer");
const path = require("path");
const crypto = require("crypto"); // For generating unique random names
const fs = require("fs");

const uploadDir = "uploads/images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the 'uploads/images' folder
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using a random string and timestamp
    const uniqueName =
      crypto.randomBytes(16).toString("hex") + path.extname(file.originalname); // Random hex string + original extension
    cb(null, uniqueName); // Set the unique name
  },
});

// Initialize multer
const upload = multer({ storage: storage });

router.post(
  "/photos",
  authMiddleware, // Ensure the user is authenticated
  upload.single("image"), // Handle the image upload
  async (req, res) => {
    console.log("Request body:", req.body); // This should not be undefined now
    console.log("Uploaded file:", req.file); // The uploaded file details

    // Extract the fields from req.body
    const { name, description } = req.body;
    const contentType = req.file ? req.file.mimetype : "unknown"; // Get contentType from the file

    // If no image is uploaded, return an error
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const postedBy = req.user.userId; // Get user ID from token

    // Create the photo document
    const photo = new Photo({
      name,
      imagePath: `/uploads/images/${req.file.filename}`,
      contentType,
      description,
      postedBy,
    });

    try {
      // Save the photo to the database
      await photo.save();
      res.status(201).json(photo); // Return the photo object after saving
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all photos (public route)
router.get("/photos", async (req, res) => {
  try {
    const photos = await Photo.find({ hidden: false }).sort({ createdAt: -1 });
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all photos (public route)
router.get("/photos/hot", async (req, res) => {
  try {
    const photos = await Photo.find({ hidden: false }).sort({ createdAt: -1 });

    // Apply time decay to the number of likes
    const currentTime = new Date();
    const photosWithDecay = photos.map((photo) => {
      const timeDiff = (currentTime - photo.createdAt) / (1000 * 3600 * 24); // time in days
      const decayFactor = 1 / (timeDiff + 1); // Simple decay formula: votes decrease over time
      const adjustedLikes = photo.likes * decayFactor;
      photo.adjustedLikes = adjustedLikes;
      return photo;
    });

    // Sort by adjusted likes after applying decay
    photosWithDecay.sort((a, b) => b.adjustedLikes - a.adjustedLikes);

    res.status(200).json(photosWithDecay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/Dislike/Remove like/Remove dislike photo (protected route)
router.post("/photos/:id/vote", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body; // 'like', 'dislike', 'removeLike', 'removeDislike'
  const userId = req.user.userId; // Get the userId from the decoded token

  try {
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Handle 'like' action
    if (voteType === "like") {
      // Ensure the user hasn't already disliked the photo
      if (photo.dislikesBy.includes(userId)) {
        return res.status(400).json({
          message: "You cannot dislike and like a photo at the same time",
        });
      }

      // Add the user to the likesBy array and increment the likes
      if (photo.likesBy.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You have already liked this photo" });
      }
      photo.likesBy.push(userId);
      photo.likes += 1;

      // Handle 'removeLike' action
    } else if (voteType === "removeLike") {
      if (!photo.likesBy.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You haven't liked this photo yet" });
      }

      // Remove the user from the likesBy array and decrement the likes
      photo.likesBy = photo.likesBy.filter(
        (user) => user.toString() !== userId.toString()
      );
      photo.likes -= 1;

      // Handle 'dislike' action
    } else if (voteType === "dislike") {
      // Ensure the user hasn't already liked the photo
      if (photo.likesBy.includes(userId)) {
        return res.status(400).json({
          message: "You cannot like and dislike a photo at the same time",
        });
      }

      // Add the user to the dislikesBy array and increment the dislikes
      if (photo.dislikesBy.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You have already disliked this photo" });
      }
      photo.dislikesBy.push(userId);
      photo.dislikes += 1;

      // Handle 'removeDislike' action
    } else if (voteType === "removeDislike") {
      if (!photo.dislikesBy.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You haven't disliked this photo yet" });
      }

      // Remove the user from the dislikesBy array and decrement the dislikes
      photo.dislikesBy = photo.dislikesBy.filter(
        (user) => user.toString() !== userId.toString()
      );
      photo.dislikes -= 1;
    } else {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    await photo.save();
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment to photo (protected route)
router.post("/photos/:id/comment", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const postedBy = req.user.userId; // Get the userId from the decoded token

  // Create a new comment object
  const comment = new Comment({
    text,
    postedBy,
    photo: id,
  });

  try {
    // Save the comment to the database
    await comment.save();

    // Find the photo and add the comment ID to its comments array
    const photo = await Photo.findById(id);
    photo.comments.push(comment._id);
    await photo.save();

    // Populate the postedBy field to include user details (username)
    const populatedComment = await Comment.findById(comment._id).populate(
      "postedBy",
      "username"
    );

    // Send the populated comment back to the frontend
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Flag photo as inappropriate (protected route)
router.post("/photos/:id/flag", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const photo = await Photo.findById(id);
    photo.flags += 1;
    if (photo.flags >= 3) {
      photo.hidden = true;
    }
    await photo.save();
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/photos/:id", async (req, res) => {
  const { id } = req.params; // Get the photo ID from the request params

  try {
    const photo = await Photo.findById(id).populate({
      path: "comments",
      populate: {
        path: "postedBy", // Populate the postedBy field (user details)
        select: "username", // Only fetch the username
      },
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.status(200).json(photo); // Return the photo object
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
