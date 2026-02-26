import mongoose from "mongoose";

const userScoreSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    game: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserScore", userScoreSchema);