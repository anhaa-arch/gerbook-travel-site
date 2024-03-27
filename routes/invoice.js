const express = require("express");
const upload = require("../middleware/fileUpload");

const {
  create,
  update,
  detail,
  findDelete,
  getAll,
} = require("../controller/invoice");
const router = express.Router();

router.route("/").post(upload.array("files"), create).get(getAll);

router
  .route("/:id")
  .put(upload.array("files"), update)
  .delete(findDelete)
  .get(detail);

module.exports = router;
