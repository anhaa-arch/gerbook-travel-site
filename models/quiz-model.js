const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  question: String,
  options: [String],
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
  },
  correctAnswer: String,
});

const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = Quiz;
