const mongoose = require("mongoose");
const { Schema } = mongoose;

const additionalSchema = new Schema({
  logo: {
    type: String,
  },
  cover: {
    type: String,
  },
  colorFrom: {
    type: String,
  },
  colorTo: {
    type: String,
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

module.exports = mongoose.model("Additional", additionalSchema);
