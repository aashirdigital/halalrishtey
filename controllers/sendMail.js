const nodemailer = require("nodemailer");

module.exports = async (email, subject, otp, msg) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "muslimsaathiofficial@gmail.com",
        pass: "qengynbbvilixdqb",
      },
    });
    await transporter.sendMail({
      from: "muslimsaathiofficial@gmail.com", // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      text: `${msg} ${otp}`, // plain text body
      html: `${msg}`, // html body
    });
    console.log("Email sent successfully.");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};
