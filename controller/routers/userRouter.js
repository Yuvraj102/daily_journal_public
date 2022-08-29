const express = require("express");

const router = express.Router();
const { protect } = require("./../helper/authHelper");
const userModel = require("./../../model/userModel");
const { updateOne } = require("./../helper/factoryHandler");

router.post("/bio", protect, async (req, res, next) => {
  const bioText = req.body.bioText;
  if (!bioText) {
    return res.json({
      status: "fail",
      message: "Error no body bio",
    });
  }

  const updatedProfile = await updateOne(
    userModel,
    { email: req.user.email },
    { bio: bioText.slice(0, 199) }
  );

  if (!updatedProfile) {
    return res.json({
      status: "fail",
      message: "Error in updating profile",
    });
  } else {
    return res.json({
      status: "success",
      message: "reload ",
    });
  }
});

module.exports = router;
