import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    meetingId: { type: String, required: true, unique: true }, // e.g., meetspot1, meetspot2
    passwordHash: { type: String, required: true },
    hostUsername: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

roomSchema.index({ meetingId: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

export { Room };