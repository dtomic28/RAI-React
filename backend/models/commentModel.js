var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  text: { type: String, required: true },
  postedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  photo: { type: Schema.Types.ObjectId, ref: "photo", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
