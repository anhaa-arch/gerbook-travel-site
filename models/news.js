const mongoose = require("mongoose");
const { Schema } = mongoose;

const newsSchema = new Schema({
  name: {
    type: String,
  },
  photo: {
    type: String,
  },
  special: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("News", newsSchema);
