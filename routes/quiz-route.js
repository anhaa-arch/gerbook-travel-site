const express = require("express");

const router = express();
const {
  create,
  update,
  detail,
  get,
  findDelete,
  getAll,
} = require("../controller/quiz-controller");
router.route("/").post(create).get(get);
router.route("/:lesson_id").get(getAll);
router.route("/:id").get(findDelete);

module.exports = router;
