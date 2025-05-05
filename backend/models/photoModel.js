const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the photo schema with a base64 string for the image
const photoSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Store image as a base64 string
  contentType: { type: String, required: true }, // Store the content type (e.g., image/jpeg)
  postedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  flags: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("photo", photoSchema);
