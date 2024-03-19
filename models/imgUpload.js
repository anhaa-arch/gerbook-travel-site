const mongoose = require("mongoose");
const { Schema } = mongoose;

const imgSchema = new Schema({
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", imgSchema);
