const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
    create,
    update,
    detail,
    findDelete,
    getAll
} = require("../controller/course-controller");


router.route('/').post(create).get(getAll)
router.route('/:id').put(update).delete(findDelete).get(detail);


module.exports = router