// this will contain function related to auth to be exported
const jwtHandler = require("./tokenManager");
// check is the user is logged in, if user set property res.user
const protect = async (req, res, next) => {
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
  // Verify the token if validated than continue or delete the cookie and redirect to re-signin
  const tokenResult = await jwtHandler.verifyToken(token);
  if (tokenResult instanceof Error) {
    console.log("wrong token logging out:", tokenResult);
    return res.redirect("/auth/logout");
  }
  req.user = tokenResult;
  res.locals.user = tokenResult;
  next();
};
// light protect is compulsary method
const lightProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.includes("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Verify the token if validated than continue or delete the cookie and redirect to re-signin
  if (token) {
    const tokenResult = await jwtHandler.verifyToken(token);
    if (tokenResult instanceof Error) {
      console.log("wrong token logging out:", tokenResult);
      return res.redirect("/auth/logout");
    }
    req.user = tokenResult;
    res.locals.user = tokenResult;
  }

  next();
};
module.exports = { protect, lightProtect };
