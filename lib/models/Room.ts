import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    creatorEmail: {
      type: String,
      required: true,
    },
    oppositeUserId: {
      type: String,
      default: null,
    },
    oppositeUserName: {
      type: String,
      default: null,
    },
    oppositeUserEmail: {
      type: String,
      default: null,
    },
    invitedEmail: {
      type: String,
      default: null,
    },
    creatorStarted: {
      type: Boolean,
      default: false,
    },
    oppositeUserStarted: {
      type: Boolean,
      default: false,
    },
    winner: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["waiting", "ready", "spinning", "completed"],
      default: "waiting",
    },
    entryPrice: {
      type: Number,
      default: 100,
      min: 0,
    },
    oppositeUserEntryPrice: {
      type: Number,
      default: null,
    },
    spinStartTime: {
      type: Date,
      default: null,
    },
    spinDuration: {
      type: Number,
      default: 5000,
      description: "Spin duration in milliseconds",
    },
  },
  { timestamps: true },
);

export const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
