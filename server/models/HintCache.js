import mongoose from "mongoose";

const hintSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    unique: true,
  },
  hints: {
    type: [String],
    required: true,
  },
});

export default mongoose.model("HintCache", hintSchema);