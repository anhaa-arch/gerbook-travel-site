const express = require("express");
const upload = require("../middleware/fileUpload");

const { create } = require("../controller/imgUpload");
const router = express.Router();

//"/api/v1/user"
// protect, authorize("admin"),  nemeh
router.route("/").post(upload.single("file"), create);

module.exports = router;
