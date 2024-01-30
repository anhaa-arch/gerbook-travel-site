const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course"
  },
})

const invoiceSchema = new Schema({
  course: [courseSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalPrice: Number,
  sender_invoice_id: {
    type: String
  },
  qpay_invoice_id: {
    type: String,
  },
  status: {
    type: String,
    enum: ["paid", "pending"],
    default: "pending"

  },
  createdInvoiceDateTime: { type: Date },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);
