//http://localhost:5000/auth/google-redirect GOOGLE REDIRECT

const express = require("express");
const { append } = require("express/lib/response");
const nodemailer = require("./../helper/nodemailer");
const router = express.Router();
const {
  getAccessTokenFromCode,
  getGoogleUserInfoFromToken,
} = require("../helper/googleConfig");
const userModel = require("../../model/userModel");
const factoryHandler = require("../helper/factoryHandler");
const jwtManager = require("../helper/tokenManager");

router.get("/google-redirect", async (req, res) => {
  // supposed to get a ?code=343j4hhj2
  const code = req.query?.code;
  if (!code) {
    return res.status(503).send("<h1> Missing code Auth </h1>");
  }
  const access_token = await getAccessTokenFromCode(code);
  if (access_token instanceof Error) {
    console.log("AT ERROR. authRouter:16", access_token);
    return res.status(503).send("<h1> AT Error </h1>");
  }
  const googleUserInfo = await getGoogleUserInfoFromToken(access_token);
  if (googleUserInfo instanceof Error) {
    console.log("AT ERROR. authRouter:21", access_token);
    return res.status(503).send("<h1> UserInfo Error </h1>");
  }
  //   Auth User, send Token and redirect to feed page
  // 1. Check if user already exist's
  const userEmail = await factoryHandler.findOne(userModel, {
    email: googleUserInfo.email,
  });
  if (userEmail instanceof Error) {
    console.log("Error in signing up: ", userEmail);
    return res
      .status(503)
      .send("Internal Error with signing you contact developer ");
  } else if (userEmail) {
    // 2. give user token
    console.log("already exist's");
    const token = jwtManager.createToken({
      email: userEmail.email,
      picture: userEmail.profilePhotoUrl,
      name: userEmail.displayName,
      bio: userEmail?.bio || "",
    });
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 89 * 24 * 60 * 60 * 1000), //89 days
    });
    res.redirect("/feed");
  } else {
    // 3. Register user and give user token
    const newUser = await factoryHandler.createOne(userModel, {
      email: googleUserInfo.email,
      displayName: googleUserInfo.name,
      profilePhotoUrl: googleUserInfo.picture,
    });
    if (newUser instanceof Error) {
      console.log("Error in Creating up user: ", newUser);
      return res
        .status(503)
        .send("Internal Error with creating you contact developer ");
    }
    // create a token
    const token = jwtManager.createToken({
      email: newUser.email,
      picture: newUser.profilePhotoUrl,
      name: newUser.displayName,
      bio: newUser?.bio || "",
    });

    nodemailer.sendEmail(`${newUser.email}`, "Thank you for choosing us...");

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 89 * 24 * 60 * 60 * 1000), //89 days
    });
    res.redirect("/feed");
  }
});
router.get("/logout", (req, res) => {
  // check for cookies

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.includes("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.redirect("/#singInPopup");
  }
  // expire the cookie
  res.clearCookie("token");

  res.redirect("/?refresh=true");
});

module.exports = router;
