const express = require("express");
const router = express();
const { protect } = require("./../helper/authHelper");
const commentModel = require("./../../model/commentModel");
const userModel = require("./../../model/userModel");
const factoryHandler = require("./../helper/factoryHandler");

router.get("/", protect, (req, res) => {});
router.post("/:postId", protect, async (req, res, next) => {
  const comment = req.body.comment;
  const postId = req.params.postId;
  if (!comment || !postId) {
    return next(new Error("Comment cannot be empty OR postId missing"));
  }
  // store the comment in db
  const postedPerson = await factoryHandler.findOne(userModel, {
    email: req.user.email,
  });
  if (!postedPerson) {
    return next(new Error("Posted user not found"));
  }

  const commentDoc = {
    body: comment,
    postedBy: req.user.email,
    postedByPerson: postedPerson._id,
    forPost: postId,
  };
  const newComment = await factoryHandler.createOne(commentModel, commentDoc);
  if (!newComment) {
    return next(new Error("Failed to post the comment. contact developer"));
  }
  res.redirect("/post/" + postId);
});
module.exports = router;
