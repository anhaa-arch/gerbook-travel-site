const mongoose = require("mongoose");
const { Schema } = mongoose;

const suuldUzsenVideoSchema = new Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("SuuldUzsenVideo", suuldUzsenVideoSchema);
