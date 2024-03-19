const express = require("express");
const upload = require("../middleware/fileUpload");

const { protect } = require("../middleware/protect");
const {
  create,
  detail,
  findDelete,
  getAll,
  update,
} = require("../controller/news");
const router = express.Router();

//"/api/v1/user"
// protect, authorize("admin"),  nemeh
router.route("/").get(getAll).post(upload.single("file"), create);
router
  .route("/:id")
  .put(upload.single("file"), protect, update)
  .delete(protect, findDelete)
  .get(detail);

module.exports = router;
