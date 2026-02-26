import React, { useState } from "react";
import socket from "../socket";
import { players } from "../data/players";

export default function MultiplayerGuess({ room, roomId, socketId }) {
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  if (!room || !room.state) return null;

  const { timeLeft, hints, revealedHints, winner, phase, answer } = room.state;
  const meWon = winner === socketId;
  const isPlaying = phase === "playing";

  const timerClass =
    timeLeft > 15 ? "green" : timeLeft > 7 ? "yellow" : "red";

  const submit = () => {
    if (!isPlaying) return;
    if (!guess.trim()) return;

    socket.emit("submit-guess", { roomId, guess });
    setGuess("");
    setSuggestions([]);
  };

  const handleChange = (e) => {
    if (!isPlaying) return;

    const value = e.target.value;
    setGuess(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const matches = players
      .map((p) => p.name)
      .filter((name) =>
        name.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(matches);
  };

  return (
    <div className="solo-card">
      <h2>🧠 Guess the Cricketer</h2>

      <div className={`timer ${timerClass}`}>
        ⏱ {timeLeft}s
      </div>

      {hints &&
        hints.slice(0, revealedHints).map((hint, index) => (
          <p key={`hint-${index}`} className="fade-in">
            🔍 {hint}
          </p>
        ))}

      {isPlaying && (
        <>
          <input
            value={guess}
            onChange={handleChange}
            placeholder="Enter full name"
          />

          {suggestions.length > 0 && (
            <div className="suggestion-box">
              {suggestions.map((name, index) => (
                <div
                  key={`suggestion-${index}`}
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

          <button onClick={submit}>Submit</button>
        </>
      )}

      {phase === "ended" && (
        <div className="game-modal">
          <div className="modal-content">
            <h2>
              {winner
                ? meWon
                  ? "🏆 You Won!"
                  : "❌ You Lost"
                : "⌛ Time’s Up!"}
            </h2>

            <p>
              ✅ Correct Answer: <b>{answer}</b>
            </p>

            <p>🏁 Final Score: {room.players?.[socketId]?.score || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}