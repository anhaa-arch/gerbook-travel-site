const mongoose = require("mongoose");
const { Schema } = mongoose;

const catergorySchema = new Schema({
  categoryName: {
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

module.exports = mongoose.model("Category", catergorySchema);
