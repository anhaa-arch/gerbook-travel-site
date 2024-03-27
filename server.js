const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./middleware/logger.js");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./db");

// router routes import
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category.js");
const productRoutes = require("./routes/product.js");
const invoiceRoutes = require("./routes/invoice.js");
const companyRoutes = require("./routes/company.js");
const sectionRoutes = require("./routes/section.js");
const districtRoutes = require("./routes/district.js");
const errorHandler = require("./middleware/error.js");
connectDB();

const app = express();

// const corsOptions = {
//   origin: [
//     "https://www.mokta.mn",
//     "http://localhost:5173",
//     "https://www.moktamongolia.com"
//   ],
//   optionsSuccessStatus: 200,
//   credentials: true
// };

// Enable CORS for all routes
// app.use(cors(corsOptions));

app.use(cors());
app.use(logger);
app.use(express.json()); // Using built-in express.json() for JSON parsing
app.use(express.urlencoded({ extended: true })); // Using built-in express.urlencoded() for URL-encoded data parsing

// api handlers
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/section", sectionRoutes);
app.use("/api/v1/district", districtRoutes);

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
