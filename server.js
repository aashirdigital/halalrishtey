const express = require("express");
const path = require("path");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { createProxyMiddleware } = require("http-proxy-middleware");

// dotenv
dotenv.config();

// MongoDB connection
connectDB();

// Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Static file for images
app.use("/userImages", express.static(path.join(__dirname, "userImages")));
app.use("/profile/:id", express.static(path.join(__dirname, "userImages")));
app.use(
  "/admin-edit-user/:id",
  express.static(path.join(__dirname, "userImages"))
);
// Proxy middleware for images
// const imageProxy = createProxyMiddleware({
//   target: "https://mymuslimsaathi.com",
//   changeOrigin: true,
// });

// Proxy middleware for images
// app.use(
//   "/userImages",
//   (req, res, next) => {
//     console.log("Proxying request to target server:", req.url);
//     next();
//   },
//   createProxyMiddleware({
//     target: "https://mymuslimsaathi.com",
//     changeOrigin: true,
//   })
// );
// Middleware for "profile/:id" route
app.use("/profile/:id", (req, res, next) => {
  const imagePath = path.join(__dirname, "userImages", req.params.id);
  if (fs.existsSync(imagePath)) {
    express.static(path.join(__dirname, "userImages"))(req, res, next);
  }
  // else {
  //   imageProxy(req, res, next);
  // }
});
app.use("/admin-edit-user/:id", (req, res, next) => {
  const imagePath = path.join(__dirname, "userImages", req.params.id);
  if (fs.existsSync(imagePath)) {
    express.static(path.join(__dirname, "userImages"))(req, res, next);
  }
  // else {
  //   imageProxy(req, res, next);
  // }
});
// Admin
app.use("/adsImages", express.static(path.join(__dirname, "adsImages")));
// Routes
app.use("/api/user/", require("./routes/userRoutes"));
app.use("/api/image/", require("./routes/imageUploadRoutes"));
app.use("/api/contact/", require("./routes/contactRoutes"));
app.use("/api/payment/", require("./routes/paymentRoutes"));
app.use("/api/admin/", require("./routes/adminRoutes"));

// PORT
const port = process.env.PORT || 8080;

// Static files for production
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
app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_MODE} Mode on Port ${process.env.PORT}`
      .bgCyan
  );
});
