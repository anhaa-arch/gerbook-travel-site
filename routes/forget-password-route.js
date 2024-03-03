const express = require("express");
const router = express();
const {
  sentEmailVerifyCode,
  checkOpt,
} = require("../controller/forget-password-controller.js");

router.route("/").post(sentEmailVerifyCode);
router.route("/checkOpt").post(checkOpt);

module.exports = router;
