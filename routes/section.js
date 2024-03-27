const express = require("express");
const upload = require("../middleware/fileUpload");

const {
  create,
  detail,
  findDelete,
  getAll,
  update,
} = require("../controller/section");
const router = express.Router();

//"/api/v1/user"
// protect, authorize("admin"),  nemeh
router.route("/").get(getAll).post(create);
router
  .route("/:id")
  .put(update) // authorize("admin"), hassan
  .delete(findDelete)
  .get(detail); // authorize("admin"), hassan

module.exports = router;
