const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./middleware/logger.js");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./db");

const categoryRoutes = require("./routes/category.js");
const errorHandler = require("./middleware/error.js");
connectDB();

const app = express();

app.use(cors());
app.use(logger);
app.use(express.json()); // Using built-in express.json() for JSON parsing
app.use(express.urlencoded({ extended: true })); // Using built-in express.urlencoded() for URL-encoded data parsing

app.use("/api/v1/category", categoryRoutes);

// file upload limit
app.use(express.json({ limit: "24000mb" }));
app.use(express.urlencoded({ limit: "24000mb", extended: true }));
app.use("/uploads", express.static(__dirname + "/public/uploads"));

// global error handler
app.use(errorHandler);

// start Express server
const server = app.listen(
  process.env.PORT,
  console.log(`Express server is running on port ${process.env.PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled rejection error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
