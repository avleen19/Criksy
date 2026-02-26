// server.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import UserScore from "./models/UserScore.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import { players } from "./data/players.js";
import hintRoutes from "./routes/hintRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/hints", hintRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL, // frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const rooms = {};
const timers = {};


const getRandomPlayer = () =>
  players[Math.floor(Math.random() * players.length)];

const emitRoom = (roomId) => {
  const room = rooms[roomId];
  if (!room) return;
  Object.keys(room.players).forEach((id) => {
    room.players[id].score = room.scores[id] || 0;
  });

  io.to(roomId).emit("room-update", room);
};

async function saveScoresAndEmit(room, roomId) {
  for (const id in room.players) {
    const player = room.players[id];
    if (player && player.userId) {
      await UserScore.create({
        username: player.name,
        userId: player.userId,
        score: room.scores[id] || 0,
        game: room.game,
        roomId,
      });
    }
  }

  const leaderboard = await UserScore.aggregate([
    {
      $group: {
        _id: "$userId",
        username: { $first: "$username" },
        totalScore: { $sum: "$score" },
      },
    },
    { $sort: { totalScore: -1 } },
  ]);

  io.emit("global-leaderboard", leaderboard);
}

// ================= SOCKET.IO =================
io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // ---- SEARCH PLAYER ----
  socket.on("search-player", (value) => {
    if (!value) return socket.emit("player-suggestions", []);
    const matches = players
      .filter((p) => p.name.toLowerCase().startsWith(value.toLowerCase()))
      .map((p) => p.name)
      .slice(0, 5);
    socket.emit("player-suggestions", matches);
  });

  // ---- JOIN ROOM ----
  socket.on("join-room", ({ roomId, name, userId }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      const ALL_ROWS = ["India", "Australia", "South Africa", "England", "New Zealand", "Sri Lanka"];
      const COLS = ["Batsman", "Bowler", "All-rounder"];
      const shuffled = [...ALL_ROWS].sort(() => 0.5 - Math.random());
      const selectedRows = shuffled.slice(0, 3);

      rooms[roomId] = {
        hostId: socket.id,
        players: {},
        scores: {},
        step: "select",
        game: null,
        state: {
          phase: "waiting",
          rows: selectedRows,
          cols: COLS,
        },
      };
    }

    rooms[roomId].players[socket.id] = {
      name,
      userId,
      score: 0,
      filled: {},
      finished: false,
    };
    rooms[roomId].scores[socket.id] = 0;

    emitRoom(roomId);
  });

  // ---- SELECT GAME ----
  socket.on("select-game", ({ roomId, game }) => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.hostId) return;
    room.game = game;
    emitRoom(roomId);
  });

  // ---- START GAME ----
  socket.on("start-game", ({ roomId }) => {
  const room = rooms[roomId];
  if (!room || socket.id !== room.hostId) return;

  room.step = "play";
  room.state.phase = "playing";
  clearInterval(timers[roomId]);

  // ===== GUESS GAME =====
  if (room.game === "guess") {
    const p = getRandomPlayer();
    room.state.answer = p.name;
    room.state.answerLower = p.name.toLowerCase();
    room.state.timeLeft = 30; 
    room.state.revealedHints = 1;
    room.state.winner = null;
    room.state.hints = [
      `👤 ${p.country} ${p.gender} Player`,
      `🎯 Role: ${p.role}`,
      `🧠 First letter: ${p.name[0]}`,
      `🔥 IPL Player: ${p.playsIPL ? "Yes" : "No"}`,
      `🔢 Name length: ${p.name.length}`,
    ];

    timers[roomId] = setInterval(async () => {
      if (!room.state) return;
      room.state.timeLeft -= 1;

      if (room.state.timeLeft % 6 === 0 && room.state.revealedHints < room.state.hints.length) {
        room.state.revealedHints += 1;
      }

      // Time ended
      if (room.state.timeLeft <= 0) {
        clearInterval(timers[roomId]);
        room.state.phase = "ended";
        await saveScoresAndEmit(room, roomId);
      }

      emitRoom(roomId);
    }, 1000);
  }

  // ===== GRID GAME =====
  if (room.game === "grid") {
    room.state.timeLeft = 60;
    timers[roomId] = setInterval(async () => {
      if (!room.state) return;
      room.state.timeLeft -= 1;

      emitRoom(roomId);

      if (room.state.timeLeft <= 0) {
        clearInterval(timers[roomId]);
        room.state.phase = "ended";

        // Mark unanswered cells
        Object.values(room.players).forEach((player) => {
          for (const row of room.state.rows) {
            for (const col of room.state.cols) {
              const key = `${row}-${col}`;
              if (!player.filled[key]) player.filled[key] = "❌";
            }
          }
          player.finished = true;
        });

        await saveScoresAndEmit(room, roomId);
        emitRoom(roomId);
      }
    }, 1000);
  }

  emitRoom(roomId);
});
socket.on("submit-guess", async ({ roomId, guess }) => {
  const room = rooms[roomId];
  if (!room || room.state?.phase !== "playing" || room.game !== "guess") return;

  const player = room.players[socket.id];
  if (!player) return;

  // Compare guess
  if (guess.trim().toLowerCase() === room.state.answerLower) {

    room.state.winner = socket.id;

    player.score += 50;       
    room.scores[socket.id] = player.score; 

    room.state.phase = "ended";
    clearInterval(timers[roomId]);

    await saveScoresAndEmit(room, roomId);
    emitRoom(roomId);
  } else {
    player.score -= 5;
    room.scores[socket.id] = player.score; 
    emitRoom(roomId);
  }
});
  // ---- GRID SUBMIT ----
  socket.on("submit-grid", async ({ roomId, row, col, guess }) => {
    const room = rooms[roomId];
    if (!room || room.state?.phase !== "playing") return;

    const player = room.players[socket.id];
    const key = `${row}-${col}`;
    if (player.filled[key]) return;

    const p = players.find((x) => x.name.toLowerCase() === guess.toLowerCase());

    const correct = p ? p.country === row && p.role === col : false;

    player.filled[key] = correct ? guess : "❌";
    room.scores[socket.id] += correct ? 10 : -5;

    const allCells = room.state.rows.length * room.state.cols.length;
    if (Object.keys(player.filled).length === allCells) player.finished = true;

    const allDone = Object.values(room.players).every((p) => p.finished);
    if (allDone) {
      room.state.phase = "ended";
      clearInterval(timers[roomId]);
      await saveScoresAndEmit(room, roomId);
    }

    emitRoom(roomId);
  });

  socket.on("disconnect", () => {
    Object.entries(rooms).forEach(([roomId, room]) => {
      delete room.players[socket.id];
      delete room.scores[socket.id];

      if (Object.keys(room.players).length === 0) {
        clearInterval(timers[roomId]);
        delete rooms[roomId];
      } else {
        emitRoom(roomId);
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);