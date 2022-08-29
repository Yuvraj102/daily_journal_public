const express = require("express");
const router = express.Router();
const { protect } = require("./../helper/authHelper");
const postModel = require("./../../model/postModel");
const factoryHandler = require("./../helper/factoryHandler");
const userModel = require("../../model/userModel");
const commentModel = require("../../model/commentModel");
const { deleteImages } = require("./../helper/cloudinary");

router.post("/like/:postId", protect, async (req, res, next) => {
  const postId = req.params.postId;
  if (!postId) {
    return res.json({
      status: "fail",
      error: "Error no post id found",
    });
  }
  // check if the user has already liked the post
  // fetch the post
  const post = await factoryHandler.findOne(postModel, { _id: postId });
  if (!post) {
    return res.json({
      status: "fail",
      error: "Error post with given id not found",
    });
  }
  //   fetch currentUser
  const currentUser = await factoryHandler.findOne(userModel, {
    email: req.user.email,
  });
  if (!currentUser) {
    return res.json({
      status: "fail",
      error: "Error user not found",
    });
  }
  //   console.log("index", post.likes.indexOf(currentUser._id));
  if (post.likes.indexOf(currentUser._id) !== -1) {
    // user has already liked the post
    res.json({
      status: "success",
      message: "post liked",
    });
  } else {
    const updatedPost = await factoryHandler.updateOne(
      postModel,
      { _id: postId },
      { likes: [...post.likes, currentUser._id] }
    );
    console.log(updatedPost);
    if (!updatedPost) {
      return res.json({
        status: "fail",
        error: "Error liking the post",
      });
    }
  }
  res.json({
    status: "success",
    message: "post liked",
  });
});
router.get("/delete/:postId", protect, async (req, res, next) => {
  const postId = req.params.postId;
  if (!postId) {
    return next(new Error("post id not present"));
  }
  const post = await factoryHandler.findOne(postModel, { _id: postId });
  let images_ids = post.public_id_images;
  // post.images.forEach((element) => {
  //   images_ids.push(element.split("/")[element.split("/").length - 1]);
  // });
  // delete images
  await deleteImages(images_ids);
  // delete comments for that post too
  await factoryHandler.deleteMany(commentModel, { forPost: post._id });
  const deletedPost = await factoryHandler.deleteOne(postModel, {
    _id: postId,
  });
  if (deletedPost instanceof Error) {
    return next(new Error("Error deleting posts"));
  }
  res.redirect("/feed");
});
module.exports = router;
