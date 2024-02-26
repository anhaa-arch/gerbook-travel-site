const express = require("express");

const {
    create,
    update,
    detail,
    findDelete,
    getAll
} = require("../controller/suuldUzsenVideController.js");
const router = express.Router();
router.route("/").post(create).get(getAll);
router
    .route("/:id")
    .put(update)
    .delete(findDelete)
    .get(detail);

module.exports = router;
