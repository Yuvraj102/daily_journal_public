const router = require("express").Router();
const testFunction = (req, res) => {
  //   console.log(`handler started blocking ${process.pid}`);
  //   var j = 0;
  //   while (j < 10e9) {
  //     j++;
  //   }
  //   console.log(`handler unblocked ${process.pid}`);
  res.send("HEy User \n");
};
router.get("/", testFunction);

module.exports = router;
