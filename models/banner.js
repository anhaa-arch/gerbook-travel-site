const mongoose = require("mongoose");
const { Schema } = mongoose;

const bannerSchema = new Schema({
  order: {
    type: String,
  },
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Corrected "defualt" to "default"
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
