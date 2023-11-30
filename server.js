const express = require("express");
const path = require("path");
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
var cors = require("cors");
const bodyParser = require("body-parser");

// dotenv
dotenv.config();

//mongodb connection
connectDB();
// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(moragan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Static file for images
app.use("/userImages", express.static("userImages"));
app.use("/userImages", express.static(path.join(__dirname, "userImages")));
app.use(
  "/profile/userImages",
  express.static(path.join(__dirname, "userImages"))
);
app.use(
  "/admin-edit-user/:id/UserImages",
  express.static(path.join(__dirname, "userImages"))
);

//admin
app.use("/adsImages", express.static("adsImages"));
app.use("/adsImages", express.static(path.join(__dirname, "adsImages")));

// routes
app.use("/api/user/", require("./routes/userRoutes"));
app.use("/api/image/", require("./routes/imageUploadRoutes"));
app.use("/api/contact/", require("./routes/contactRoutes"));
app.use("/api/payment/", require("./routes/paymentRoutes"));
app.use("/api/admin/", require("./routes/adminRoutes"));

// PORT
const port = process.env.PORT || 8080;

// STATIC FILES RUNNING ON BUILD FOLDER
if (process.env.NODE_MODE === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API running..");
  });
}

// Listen
app.listen(port, (req, res) => {
  console.log(
    `Server running in ${process.env.NODE_MODE} Mode on Port ${process.env.PORT}`
      .bgCyan
  );
});
