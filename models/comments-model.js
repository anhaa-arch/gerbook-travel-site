const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  createUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    requred: [true, 'Тайлбар заавал оруулна уу'],
    maxlength: [200, 'Сэтгэгдэлийн урт хамгийн уртдаа 200-н  тэмдэгт байна']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comment", commentSchema);
