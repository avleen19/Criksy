import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import MultiplayerGrid from "./MultiplayerGrid";
import MultiplayerGuess from "./MultiplayerGuess";
import { useUser } from "@clerk/clerk-react";
import Leaderboard from "../pages/Leaderboard";

export default function GameRoom() {
  const { roomId } = useParams();
  const { user, isLoaded } = useUser();
  const [room, setRoom] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);

  useEffect(() => {
    const onConnect = () => setSocketId(socket.id);
    if (socket.connected) setSocketId(socket.id);
    else socket.on("connect", onConnect);
    return () => socket.off("connect", onConnect);
  }, []);

  useEffect(() => {
    if (isLoaded && user && socketId) {
      socket.emit("join-room", {
        roomId,
        name: user.firstName || user.username || "Player",
        userId: user.id,
      });
    }
  }, [isLoaded, user, socketId, roomId]);

useEffect(() => {
  const handleRoomUpdate = (updatedRoom) => {
    setRoom(updatedRoom);
  };

  socket.on("room-update", handleRoomUpdate);
  return () => socket.off("room-update", handleRoomUpdate);
}, []);


useEffect(() => {
  if (room?.state?.phase === "ended") {
    setShowGlobalLeaderboard(true);
  } else {
    setShowGlobalLeaderboard(false);
  }
}, [room]);

  if (!room) return <p className="page center">Joining room...</p>;
  const isHost = socketId === room.hostId;

  return (
    <div className="page center">
      <h2>👥 Multiplayer Room</h2>
      <p>
        📌 Room Code: <span style={{ color: "#00bcd4" }}>{roomId}</span>
      </p>

      {/* ROOM LEADERBOARD */}
      <div className="leaderboard">
        <h3>🏆 Room Leaderboard</h3>
        {Object.values(room.players)
          .sort((a, b) => b.score - a.score)
          .map((p, i) => (
            <p key={i}>
              <span className="rank">#{i + 1}</span>
              <span className="name">{p.name}</span>
              <span className="score">{p.score} pts</span>
            </p>
          ))}
      </div>

      {/* HOST GAME SELECTION */}
      {isHost && room.step === "select" && (
  <div className="lobby-card">
    <h3>Select Game 🎮</h3>
    <div className="game-select">
      <button
        className={`game-btn ${room.game === "guess" ? "selected" : ""}`}
        onClick={() => socket.emit("select-game", { roomId, game: "guess" })}
      >
        🧠 Guess the Cricketer
      </button>
      <button
        className={`game-btn ${room.game === "grid" ? "selected" : ""}`}
        onClick={() => socket.emit("select-game", { roomId, game: "grid" })}
      >
        🧩 Grid Game
      </button>
      {room.game && (
        <button
          className="primary-btn"
          onClick={() => socket.emit("start-game", { roomId })}
        >
          ▶ Start Game
        </button>
      )}
    </div>
  </div>
)}
    {/* 🔹 NON-HOST WAITING MESSAGE */}
{!isHost && room.step === "select" && (
  <div className="lobby-card">
    <h3>⏳ Waiting for host to select a game...</h3>

    {room.game && (
      <p style={{ marginTop: "10px", color: "#00bcd4" }}>
        🎮 Selected Game:{" "}
        {room.game === "guess"
          ? "Guess the Cricketer"
          : "Grid Game"}
      </p>
    )}
  </div>
)}

      {/* PLAYERS */}
      {room.step === "play" && room.game === "guess" && (
        <MultiplayerGuess room={room} roomId={roomId} socketId={socketId} />
      )}
      {room.step === "play" && room.game === "grid" && (
        <MultiplayerGrid room={room} roomId={roomId} socketId={socketId} />
      )}

      {/* GLOBAL LEADERBOARD */}
      {showGlobalLeaderboard && (
        <div style={{ marginTop: "40px" }}>
          <Leaderboard />
        </div>
      )}
    </div>
  );
}