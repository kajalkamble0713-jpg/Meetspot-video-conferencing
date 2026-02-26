import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  next: { type: Number, required: true, default: 0 }
});

const Counter = mongoose.model("Counter", counterSchema);

export { Counter };