const express = require("express");
const upload = require("../middleware/fileUpload");

const {
  create,
  detail,
  findDelete,
  getAll,
  update,
} = require("../controller/banner");
const router = express.Router();

//"/api/v1/user"
// protect, authorize("admin"),  nemeh
router.route("/").get(getAll).post(upload.single("file"), create);
router
  .route("/:id")
  .put(upload.single("file"), update) // authorize("admin"), hassan
  .delete(findDelete)
  .get(detail); // authorize("admin"), hassan

module.exports = router;
