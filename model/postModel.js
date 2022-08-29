const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A title is a required field"],
    maxlength: 150,
  },
  body: {
    type: String,
    required: [true, "A body is a required field"],
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  date: {
    type: Date,
    default: new Date(),
  },
  images: {
    type: [String],
    maxlength: 4,
    default: [],
  },
  public_id_images: {
    type: [String],
    maxlength: 4,
    default: [],
  },
  postedBy: {
    type: String,
    required: [true, "A postedBy is an required property"],
  },
  postedPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Post", postSchema);
