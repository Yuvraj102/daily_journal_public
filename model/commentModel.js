const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, "A body is a required field"],
    maxlength: 500,
  },
  postedBy: {
    type: String,
    required: [true, "A postedBy is a required field"],
  },
  postedByPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  forPost: {
    type: mongoose.Schema.Types.ObjectId, //post id
    required: [true, "A forPost is a required field"],
  },
  date: {
    type: Date,
    default: new Date(),
  },
  images: {
    type: [String],
    maxlength: 2,
    default: [],
  },
});

module.exports = mongoose.model("Comment", commentSchema);
