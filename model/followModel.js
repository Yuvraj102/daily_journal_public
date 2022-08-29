// where the second follows the first
const mongoose = require("mongoose");
const followSchema = new mongoose.Schema({
  first: {
    type: String,
    required: [true, "first field is compulsary"],
  },
  second: {
    type: String,
    required: [true, "second field is compulsary"],
  },
});
// first: the person being followed
//  second: the person following
module.exports = mongoose.model("follow", followSchema);
