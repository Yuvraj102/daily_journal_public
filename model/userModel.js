const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "An Email is a required field"],
    maxlength: 90,
  },
  profilePhotoUrl: {
    type: String,

    required: [true, "An profilePhotoUrl is a required field"],
  },
  displayName: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 200,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema);
