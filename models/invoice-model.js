const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: "Lesson"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
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
