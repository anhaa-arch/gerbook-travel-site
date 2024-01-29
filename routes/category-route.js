const express = require("express");
const upload = require("../middleware/fileUpload");

const {
  create,
  update,
  detail,
  findDelete,
  getAll
} = require("../controller/category-controller");
const router = express.Router();
const { getCategorySortItem } = require("../controller/lesson-controller")

router.route("/").post(create).get(getAll);

router
  .route("/:id")
  .put(upload.single("file"), update)
  .delete(findDelete)
  .get(detail);

router.route("/:category_id/item").get(getCategorySortItem)

module.exports = router;
