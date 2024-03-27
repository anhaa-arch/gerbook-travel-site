const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Төрлийн  нэр заавал  оруулна уу !"],
  },
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Corrected "defualt" to "default"
  },
});

module.exports = mongoose.model("Category", categorySchema);
