import React, { useMemo, useState } from "react";
import { players } from "../data/players";


const ROLES = ["Batsman", "Bowler", "All-rounder"];


const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

export default function GridGame() {
  /* 🔹 DYNAMIC ROW OPTIONS */
  const rowOptions = useMemo(() => {
    const countries = [...new Set(players.map((p) => p.country))];
    return [...countries, "Female"];
  }, []);

  /* 🔹 RANDOM GRID */
  const rows = useMemo(() => shuffle(rowOptions).slice(0, 3), [rowOptions]);
  const cols = useMemo(() => shuffle(ROLES), []);

  const [grid, setGrid] = useState({});
  const [activeCell, setActiveCell] = useState(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  /* 🔍 VALIDATION LOGIC */
  const validatePlayer = (name, row, col) => {
    const player = players.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!player) return false;

    const rowMatch =
  row === "Female"
    ? player.gender === "Female"
    : player.country === row;
    const colMatch = player.role === col;

    return rowMatch && colMatch;
  };


  const submitGuess = () => {
    if (!guess || !activeCell) return;

    const { row, col } = activeCell;
    const key = `${row}-${col}`;

    if (grid[key]) return;

    const correct = validatePlayer(guess, row, col);

    setGrid((prev) => ({
      ...prev,
      [key]: correct ? guess : "❌",
    }));

    setScore((prev) => prev + (correct ? 10 : -5));
    setMessage(correct ? "✅ Correct! +10" : "❌ Wrong! -5");

    setGuess("");
    setSuggestions([]);
    setActiveCell(null);
  };

  return (
    <div className="page center">
      <h2>🟦 Cricket Grid</h2>
      <h3>⭐ Score: {score}</h3>

      {/* GRID */}
      <div className="grid">
        <div></div>
        {cols.map((c) => (
          <div key={c} className="grid-header">
            {c}
          </div>
        ))}

        {rows.map((r) => (
          <React.Fragment key={r}>
            <div className="grid-header">{r}</div>
            {cols.map((c) => {
              const key = `${r}-${c}`;
              return (
                <div
                  key={key}
                  className={`grid-cell ${grid[key] ? "locked" : ""}`}
                  onClick={() =>
                    !grid[key] && setActiveCell({ row: r, col: c })
                  }
                >
                  {grid[key] || "?"}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* INPUT + AUTOCOMPLETE */}
      {activeCell && (
        <div className="solo-card">
          <h3>
            {activeCell.row} + {activeCell.col}
          </h3>

          <input
            placeholder="Enter player name"
            value={guess}
            onChange={(e) => {
              const value = e.target.value;
              setGuess(value);

              if (value.length > 0) {
                const matches = players
                  .map((p) => p.name)
                  .filter((name) =>
                    name.toLowerCase().includes(value.toLowerCase())
                  )
                  .slice(0, 5);

                setSuggestions(matches);
              } else {
                setSuggestions([]);
              }
            }}
          />

          {/* Suggestions Dropdown */}
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

          <button onClick={submitGuess}>Submit</button>
        </div>
      )}

      <p>{message}</p>


      <div className="rules-box">
        <h3>📜 Game Rules</h3>
        <ul>
          <li>Each cell can be attempted only once</li>
          <li>Player must satisfy both row & column condition</li>
          <li>+10 points for correct answer</li>
          <li>-5 points for wrong answer</li>
          <li>Grid is randomly generated on every refresh</li>
        </ul>
      </div>
    </div>
  );
}
