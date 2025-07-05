import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  photo?: string;
  createdAt: Date;
}

const categorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Төрлийн  нэр заавал  оруулна уу !"],
  },
  photo: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ICategory>("Category", categorySchema);