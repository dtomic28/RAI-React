const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the photo schema with a file path for the image
const photoSchema = new Schema({
  name: { type: String, required: true },
  imagePath: { type: String, required: true }, // Store file path instead of Base64
  contentType: { type: String, required: true }, // Store the content type (e.g., image/jpeg)
  postedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  flags: { type: Number, default: 0 },
  likesBy: [{ type: Schema.Types.ObjectId, ref: "user" }], // Track users who liked the photo
  dislikesBy: [{ type: Schema.Types.ObjectId, ref: "user" }], // Track users who disliked the photo
  hidden: { type: Boolean, default: false }, // Whether the photo is hidden (e.g., flagged for inappropriate content)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }], // Add the comments reference here
});

module.exports = mongoose.model("Photo", photoSchema);
