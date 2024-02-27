const mongoose = require("mongoose");
const { Schema } = mongoose;

const suuldUzsenVideoSchema = new Schema({
  lessonVideo: {
    type: String,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course"
  },
  createUser: {
    type: Schema.Types.ObjectId,
    ref: "Customer"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("SuuldUzsenVideo", suuldUzsenVideoSchema);
