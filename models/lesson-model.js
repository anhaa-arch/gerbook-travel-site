const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  createUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: [true, "Гарчиг заавал оруулах"],
    maxlength: [150, "Хамийн дээд талаа 150-н тэмдэгт байна"]
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    default: null
  },
  video: {
    type: String,
    default: "no video"
  }
});

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
