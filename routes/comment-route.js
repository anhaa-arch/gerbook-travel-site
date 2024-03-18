const express = require("express");
const { protect } = require("../middleware/protect.js")

const {
    create,
    update,
    detail,
    findDelete,
    getAll
} = require("../controller/comment-controller.js");
const router = express.Router();
router.route("/").post(protect, create).get(protect, getAll);
router
    .route("/:id")
    .put(update)
    .delete(findDelete)
    .post(protect, detail);

module.exports = router;
