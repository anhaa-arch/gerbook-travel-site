const express = require("express");
const upload = require("../middleware/fileUpload");
const { protect } = require("../middleware/protect")

const {
  create,
  update,
  detail,
  findDelete,
  getAll
} = require("../controller/course-controller");
const router = express.Router();
const { getCategorySortItem } = require("../controller/lesson-controller")
const { CourseIdSortByComment } = require("../controller/comment-controller")
router.route("/").post(protect, upload.single("file"), create).get(getAll);

router.route("/:course_id/comment").get(CourseIdSortByComment)




router
  .route("/:id")
  .put(upload.single("file"), update)
  .delete(findDelete)
  .get(detail);

router.route("/:course_id/lesson").get(getCategorySortItem);

module.exports = router;
