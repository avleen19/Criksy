import React, { useState, useEffect } from "react";
import socket from "../socket";

const ROLES = ["Batsman", "Bowler", "All-rounder"];

export default function MultiplayerGrid({ roomId, room }) {
  const [activeCell, setActiveCell] = useState(null);
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    socket.on("player-suggestions", (data) => setSuggestions(data));
    return () => socket.off("player-suggestions");
  }, []);

  if (!room?.state) return null;

  const ROWS = room.state.rows || [];
  const filled = room.players?.[socket.id]?.filled || {};
  const timeLeft = room.state.timeLeft;

  const submit = () => {
    if (!guess.trim() || !activeCell) return;

    socket.emit("submit-grid", {
      roomId,
      row: activeCell.row,
      col: activeCell.col,
      guess,
    });

    setGuess("");
    setActiveCell(null);
    setSuggestions([]);
  };

  return (
    <div className="page center">
      <h2>🟦 Multiplayer Cricket Grid</h2>
      <h3>⏱ Time Left: {timeLeft}s</h3>

      <div className="grid">
        <div className="grid-header"></div>
        {ROLES.map((role) => (
          <div key={role} className="grid-header">{role}</div>
        ))}

        {ROWS.map((r) => (
          <React.Fragment key={r}>
            <div className="grid-header">{r}</div>
            {ROLES.map((c) => {
              const key = `${r}-${c}`;
              const answer = filled[key];
              const isLocked = !!answer;
              const isActive = activeCell?.row === r && activeCell?.col === c;

              let cellClass = "grid-cell";
              if (isLocked) cellClass += answer === "❌" ? " wrong" : " correct";
              if (isActive) cellClass += " active";

              return (
                <div
                  key={key}
                  className={cellClass}
                  onClick={() => !isLocked && setActiveCell({ row: r, col: c })}
                >
                  {answer || "?"}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {activeCell && (
        <div className="grid-input-box">
          <input
            placeholder="Enter player name"
            value={guess}
            onChange={(e) => {
              const value = e.target.value;
              setGuess(value);
              if (value.trim()) socket.emit("search-player", value);
              else setSuggestions([]);
            }}
          />
          <button onClick={submit}>Submit</button>

          {suggestions.length > 0 && (
            <div className="suggestion-box">
              {suggestions.map((name, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setGuess(name);
                    setSuggestions([]);
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {room.state.phase === "ended" && (
  <div className="game-modal">
    <div className="modal-content">
      <h2>🏁 Game Over</h2>
      <p>Your Score: {room.players[socket.id]?.score || 0}</p>
    </div>
  </div>
)}
    </div>
  );
}