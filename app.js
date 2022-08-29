require("dotenv").config();
const express = require("express");
const app = express();
const os = require("os");
const cluster = require("cluster");
const path = require("path");
const mongoose = require("mongoose");
const globalErrorHandler = require("./controller/helper/globalHandler");
const cookieParser = require("cookie-parser");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); //@TODO maybe set limit:somekb in future on both
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// ROUTERS
const testRouter = require("./controller/routers/testRouter");
const viewRouter = require("./controller/routers/viewRouter");
const authRouter = require("./controller/routers/authRouter");
const commentRouter = require("./controller/routers/commentRouter");
const userRouter = require("./controller/routers/userRouter");
const postRouter = require("./controller/routers/postRouter");
// LISTEN TO DB, // @TODO uncomment this in production
// mongodb://localhost/daily_journal
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log(`db connected successfully`);
  })
  .catch((err) => {
    console.log(`err connecting db`);
  });
//
app.use("/test", testRouter);
app.use("/", viewRouter);
app.use("/auth", authRouter);
app.use("/comment", commentRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use(globalErrorHandler);

const cpus = os.cpus();
const PORT = process.env.PORT || 5000;
// @TODO uncomment this in production
if (cluster.isMaster) {
  for (var i = 0; i < cpus.length; i++) {
    cluster.fork();
  }
} else {
  app.listen(PORT, () => {
    console.log(`server started on port ${PORT} with process ${process.pid}`);
  });
}
// app.listen(PORT, () => {
//   console.log(`server started on port ${PORT} with process ${process.pid}`);
// });
