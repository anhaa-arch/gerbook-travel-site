const express = require("express");
const upload = require("../middleware/fileUpload");
const { protect } = require("../middleware/protect")
const {
  create,
  update,
  detail,
  findDelete,
  getAll
} = require("../controller/lesson-controller");

const router = express.Router();

// const cpUploads = upload.fields([
//   { name: "video" },
// ]);

router.route("/").post(upload.single("video"), create).get(getAll);
router.route("/:id").put(upload.single("video"), update).delete(findDelete).get(detail);


module.exports = router;
