const queryString = require("query-string");
const axios = require("axios");

const stringifiedParams = queryString.stringify({
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uri: process.env.REDIRECT_URI,
  scope: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" "),
  response_type: "code",
  access_type: "offline",
  prompt: "consent",
});

const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;

async function getAccessTokenFromCode(code) {
  try {
    const { data } = await axios({
      url: "https://oauth2.googleapis.com/token",
      method: "post",
      data: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      },
    });
    return data.access_token;
  } catch (err) {
    return new Error(`Error getting AccessToken: ${err}`);
  }
}

async function getGoogleUserInfoFromToken(token) {
  try {
    const { data } = await axios({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      method: "get",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err) {
    return new Error(`Error in getting User data from tkn: ${err}`);
  }
}

module.exports = {
  googleLoginUrl,
  getAccessTokenFromCode,
  getGoogleUserInfoFromToken,
};
