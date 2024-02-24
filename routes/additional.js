const express = require("express");
const upload = require("../middleware/fileUpload");

const { create, update, get } = require("../controller/additional");
const router = express.Router();

router
  .route("/")
  .post(upload.fields([{ name: "cover" }, { name: "logo" }]), create)
  .get(get);

router
  .route("/:id")
  .put(upload.fields([{ name: "cover" }, { name: "logo" }]), update);

module.exports = router;
