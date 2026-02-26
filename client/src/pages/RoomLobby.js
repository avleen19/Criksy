import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomLobby() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Enter Room ID");
      return;
    }
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="page center">
      <h1 className="home-title">Multiplayer Lobby 👥</h1>
      <p className="home-subtitle">
        Create a room or join your friend
      </p>

      {/* ===== NEW INFO SECTION ===== */}
      <div className="multi-info">
        <div>
          <h4>⚡ Fast Rounds</h4>
          <p>Instant scoring & quick gameplay</p>
        </div>
        <div>
          <h4>🏆 Leaderboard</h4>
          <p>Compete with friends live</p>
        </div>
        <div>
          <h4>🎯 Skill Based</h4>
          <p>Knowledge wins the match</p>
        </div>
      </div>

      <div className="lobby-card">
        <button className="primary-btn" onClick={createRoom}>
          ➕ Create New Room
        </button>

        <div className="divider">OR</div>

        <input
          placeholder="Enter Room Code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button className="secondary-btn" onClick={joinRoom}>
          🔑 Join Room
        </button>
      </div>
    </div>
  );
}
