const express = require("express");
const router = express.Router();
const Photo = require("../models/photoModel");
const Comment = require("../models/commentModel");
const authMiddleware = require("../middleware/authMiddleware"); // Import the authentication middleware

// Upload a new photo (protected route) - Directly storing Base64-encoded image
router.post("/photos", authMiddleware, async (req, res) => {
  const { name, imageBase64, contentType } = req.body;
  const postedBy = req.user.userId; // Get the userId from the decoded token

  // Ensure the Base64 string and contentType are provided
  if (!imageBase64 || !contentType) {
    return res
      .status(400)
      .json({ message: "Image and content type are required" });
  }

  const photo = new Photo({
    name,
    image: imageBase64, // Store the Base64 string of the image
    contentType, // Store the content type (e.g., image/jpeg)
    postedBy,
  });

  try {
    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all photos (public route)
router.get("/photos", async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });

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

// Like/Dislike photo (protected route)
router.post("/photos/:id/vote", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body; // 'like' or 'dislike'

  try {
    const photo = await Photo.findById(id);
    if (voteType === "like") {
      photo.likes += 1;
    } else if (voteType === "dislike") {
      photo.dislikes += 1;
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

  const comment = new Comment({ text, postedBy, photo: id });

  try {
    await comment.save();
    const photo = await Photo.findById(id);
    photo.comments.push(comment._id);
    await photo.save();
    res.status(201).json(comment);
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

module.exports = router;
