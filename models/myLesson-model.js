const mongoose = require("mongoose");

const { Schema } = mongoose;

const myLessonSchema = new Schema({
  createUser: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MyLesson", myLessonSchema);
