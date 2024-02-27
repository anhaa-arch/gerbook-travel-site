const express = require("express");
const { protect } = require("../middleware/protect.js")

const {
    create,
    update,
    detail,
    findDelete,
    getAll
} = require("../controller/suuldUzsenVideController.js");
const router = express.Router();
router.route("/").post(protect, create).get(getAll);
router
    .route("/:id")
    .put(update)
    .delete(findDelete)
    .post(protect, detail);

module.exports = router;
