import express from "express";
import upload from "../middleware/fileUpload";

import {
  create,
  detail,
  findDelete,
  getAll,
  update,
} from "../controller/category";

const router = express.Router();

//"/api/v1/user"
// protect, authorize("admin"),  nemeh
router.route("/").get(getAll).post(upload.single("file"), create);
router
  .route("/:id")
  .put(upload.single("file"), update) // authorize("admin"), hassan
  .delete(findDelete)
  .get(detail); // authorize("admin"), hassan

export default router;