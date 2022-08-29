const router = require("express").Router();
const { googleLoginUrl } = require("../helper/googleConfig");
const { protect, lightProtect } = require("./../helper/authHelper");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, req.user.email + uuidv4() + ".jpg");
  },
});
const nodemailer = require("./../helper/nodemailer");
const upload = multer({ storage });
const cloudManager = require("./../helper/cloudinary");
const factoryHandler = require("./../helper/factoryHandler");
const postModel = require("./../../model/postModel");
const userModel = require("./../../model/userModel");
const commentModel = require("./../../model/commentModel");
const followModel = require("../../model/followModel");

router.get("/", lightProtect, (req, res) => {
  res.status(200).render("home", { title: "Home", googleLoginUrl });
});
router.get("/feed", protect, async (req, res) => {
  // fetch feed data
  const feed = await factoryHandler.getAll(postModel, "getAllPosts");
  // console.log("got all posts:", feed);
  res.status(200).render("feed", { title: "Feed", feed });
});
// THE PROFILE PAGE
router.get("/profile/:postEmail", lightProtect, async (req, res, next) => {
  const profileEmail = req.params.postEmail;
  if (!profileEmail || !profileEmail.includes("@")) {
    return next(new Error("User not found please check the params again"));
  }
  // fetch the user
  const profileUser = await factoryHandler.findOne(userModel, {
    email: profileEmail,
  });
  if (!profileUser) {
    return next(new Error("User not found"));
  }
  // get all posts for that user
  const feed = await factoryHandler.getAll(postModel, "getUserPosts", {
    email: profileEmail,
  });
  // check if the current user follows this user
  if (req.user && req?.user.email !== profileUser.email) {
    const followRelation = await factoryHandler.findOne(followModel, {
      first: profileUser.email,
      second: req.user.email,
    });
    if (followRelation) {
      // user already follows
      res.locals.followStatus = "FOLLOWING";
    } else {
      res.locals.followStatus = "FOLLOW";
    }
  } else {
    res.locals.followStatus = "FOLLOW";
  }
  // get current following and followers stat && also total posts
  let followers = await factoryHandler.getAll(followModel, "getAllFollowers", {
    email: profileUser.email,
  });
  if (!followers) followers = 0;
  // get all following
  let followings = await factoryHandler.getAll(
    followModel,
    "getAllFollowings",
    { email: profileUser.email }
  );
  if (!followings) followings = 0;

  res.status(200).render("profile", {
    title: "Profile",
    profileUser,
    feed,
    followers,
    followings,
  });
  // console.log("hello");

  // res.render("delete", { title: "Hello" });
});
// follow/following routes
// follow route
router.post(
  "/profile/follow/:followedEmail",
  protect,
  async (req, res, next) => {
    // get the followed and following users
    const personFollowing = await factoryHandler.findOne(userModel, {
      email: req.user.email,
    }); // the person who initiated the follow request
    const personFollowedEmail = req.params.followedEmail;
    if (!personFollowedEmail) {
      return res.json({
        status: "fail",
        error: "Error person followed email is compulsary",
      });
    }
    const personFollowed = await factoryHandler.findOne(userModel, {
      email: personFollowedEmail,
    }); // the person who is being followed
    if (!personFollowed || !personFollowing) {
      return res.json({
        status: "fail",
        error: "Error person followed or person following missing",
      });
    }
    // check if the user is trying to follow himself, if so just reload
    if (personFollowing.email == personFollowed.email) {
      return res.json({
        status: "success",
        message: "reload ",
      });
    }
    // check if the person already follows
    const followDocument = await factoryHandler.findOne(followModel, {
      first: personFollowed.email,
      second: personFollowing.email,
    });
    if (followDocument) {
      // the request is already fullfilled personFollowing already followed personFollowed
      return res.json({
        status: "success",
        message: "Already exist's relation",
      });
    }
    // create the follow/follower relation
    const followRelationDoc = await factoryHandler.createOne(followModel, {
      first: personFollowed.email,
      second: personFollowing.email,
    });
    if (!followRelationDoc) {
      return res.json({
        status: "fail",
        error: "Error creating follow relation contact developer",
      });
    }
    res.json({
      status: "success",
      message: "Reload relation created",
    });
  }
);
// unfollow route
router.post("/profile/unfollow/:unfollowedEmail", protect, async (req, res) => {
  const personFollowing = await factoryHandler.findOne(userModel, {
    email: req.user.email,
  }); // person who initiated unfollow request
  const personUnfollowedEmail = req.params.unfollowedEmail;
  if (!personUnfollowedEmail) {
    return res.status(403).json({
      status: "fail",
      error: "Error person unfollowed email compulsary",
    });
  }
  const personUnfollowed = await factoryHandler.findOne(userModel, {
    email: personUnfollowedEmail,
  }); // person who is being unfollowed
  if (!personUnfollowed) {
    return res.json({
      status: "fail",
      error: "Error personUnfollowed not found",
    });
  }
  // check if the user is trying to unfollow himself, if so just reload
  if (personFollowing.email == personUnfollowed.email) {
    return res.json({
      status: "success",
      message: "reload ",
    });
  }
  // delete the relation where personFollowing follows personUnFollowed
  const deletedRelation = await factoryHandler.deleteOne(followModel, {
    first: personUnfollowed.email,
    second: personFollowing.email,
  });
  if (deletedRelation instanceof Error) {
    return res.json({
      status: "fail",
      error: "Error deleting relation",
    });
  }
  res.json({
    status: "success",
    message: "Person unfollowed",
  });
});
// A full post with imgs
router.get("/post/:postId", lightProtect, async (req, res, next) => {
  const postId = req.params.postId;
  if (!postId) {
    return next(new Error("post id does not exist's "));
  }
  const post = await postModel
    .findOne({ _id: postId })
    .populate("postedPerson");
  if (!post) {
    return next(new Error("post with that id does not exist's "));
  }
  // Get comments for post
  const comments = await factoryHandler.getAll(commentModel, "getAllComments", {
    postId,
  });
  // check if the user has liked the post or not
  let liked = false;
  if (req.user) {
    const currentUser = await factoryHandler.findOne(userModel, {
      email: req.user.email,
    });
    if (post.likes.indexOf(currentUser._id) !== -1) {
      // current user has liked the post
      liked = true;
    }
  }
  res.locals.liked = liked;
  res.status(200).render("post", { title: "Post", post, comments });
});
router.get("/create", protect, (req, res) => {
  res.status(200).render("create", { title: "Create" });
});
router.post(
  "/create",
  protect,
  upload.fields([{ name: "files", maxCount: 4 }]),
  async (req, res, next) => {
    const postObj = {
      images: [],
      public_id_images: [],
    };
    // upload Images
    // sharpen the uploaded images
    // Take care later

    // upload the images
    // WORKS
    for (let z = 0; z < req.files.files.length; z++) {
      let fileElement = req.files.files[z];
      try {
        const result = await cloudManager.upload(
          fileElement.destination + "/" + fileElement.filename
        );
        postObj.images.push(result.secure_url);
        postObj.public_id_images.push(result.public_id);
      } catch (err) {
        console.log("cloudinary error:", err);
        return next(
          new Error("Problem creating a new Post Err in cloud service")
        );
      }
    }
    // Upload post
    postObj.title = req.body.title;
    postObj.body = req.body.body;
    postObj.postedBy = req.user.email;
    // console.log("postObj:", postObj);
    const postedUser = await factoryHandler.findOne(userModel, {
      email: req.user.email,
    });
    if (postedUser instanceof Error) {
      return next(new Error("Problem creating a new Post, user not found"));
    }
    postObj.postedPerson = postedUser._id;

    const newPost = await factoryHandler.createOne(postModel, postObj);
    if (newPost instanceof Error) {
      return next(new Error("Problem creating a new Post"));
    }
    // console.log("This is body:", req.body, "\n");
    // console.log("These are file info: ", req.files.files); //the second .files being the name of the inpu field
    // console.log("Current user", req.user);
    // res.status(200).json(newPost);
    res.redirect("/feed");
  }
);
router.get("/error", lightProtect, (req, res) => {
  const message = req.query?.message;
  if (!message) {
    return res.redirect("/");
  }
  res.status(200).render("error", { title: "Create", ErrorMessage: message });
});
module.exports = router;
