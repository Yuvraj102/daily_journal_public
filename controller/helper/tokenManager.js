const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};
const verifyToken = async (token) => {
  try {
    return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return new Error(`Error in verifing token: ${err}`);
  }
};
module.exports = { createToken, verifyToken };
