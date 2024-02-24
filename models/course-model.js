const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new Schema({
  coursname: {
    type: String,
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: "no employee",
  },
  photo: {
    type: String,
    default: "no  photo",
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: "no category",
  },
  description: {
    type: String,
    maxlength: [500, "Тайлбар хамгийн ихдээ 500-н тэмдэгт байна!"],

  },
  price: {
    type: Number,
    required: [true, "Үнэ заавал  оруулна уу !"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", courseSchema);
