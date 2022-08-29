const nodemailer = require("nodemailer");
const pug = require("pug");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yuvraj.agarkar.projects@gmail.com",
    pass: "dvfnpygifxbswohh",
    // pass: "yegritnmiomqtmne",
  },
});

const sendEmail = (to, subject) => {
  transporter
    .sendMail({
      from: '"Yuvraj Agarkar Projects" <yuvraj.agarkar.projects@gmail.com>',
      to: `${to}`,
      subject: `${subject}`,
      text: "Thank you for choosing us",
      html: pug.renderFile(`${__dirname}/../../views/email.pug`),
    })
    .then((info) => {
      console.log("sending email:", info);
    })
    .catch((err) => {
      console.log(`err sending email:${err}`);
    });
};

module.exports = { sendEmail };
