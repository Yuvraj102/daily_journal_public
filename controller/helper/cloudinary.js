const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
  //   secure: true,
});

// @TODO take care later
async function sharpenImage(fileAddress) {
  //   WORK ON THIS
  await sharp(fileAddress)
    .resize(680, 340)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(fileAddress);
}
function upload(file) {
  return new Promise(function (resolve, reject) {
    cloudinary.uploader.upload(file, function (err, result) {
      if (err) {
        reject(err);
        console.log("Error occured cloudinary:", err);
      } else {
        resolve(result);
        // console.log("This is cloudinary result:", result);
      }
    });
  });
}
const deleteImages = async (images) => {
  console.log("images>>", images);
  for (let i = 0; i < images.length; i++) {
    cloudinary.uploader.destroy(images[i], function (result) {
      console.log("cloudinary assets deletion>>>", result);
    });
  }
};
module.exports = { upload, sharpenImage, deleteImages };
