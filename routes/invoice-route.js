const express = require("express");
const router = express();
const {
  create,
  detail,
  findDelete,
  getAll,
} = require("../controller/invoice-controller.js");
router.route("/").post(create).get(getAll);
router.route("/:id").get(detail);

module.exports = router;
