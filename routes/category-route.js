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
const { getCategoyrSortCourse } = require("../controller/course-controller")

router.route("/").post(create).get(getAll);

router
  .route("/:id")
  .put(upload.single("file"), update)
  .delete(findDelete)
  .get(detail);

router.route("/:category_id/course").get(getCategoyrSortCourse)

module.exports = router;
