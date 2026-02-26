import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  roomId: String,
  players: Array,
  winner: String,
  gameType: String,
  playedAt: { type: Date, default: Date.now }
});

export default mongoose.model("GameHistory", gameSchema);