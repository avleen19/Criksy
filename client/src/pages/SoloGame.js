import React, { useEffect, useState } from "react";
import { players } from "../data/players";

const MAX_ATTEMPTS = 4;
const MAX_POINTS = 50;

export default function SoloGame() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [wikiHint, setWikiHint] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState(MAX_POINTS);


  const startGame = async () => {
    const randomPlayer =
      players[Math.floor(Math.random() * players.length)];

    setSelectedPlayer(randomPlayer);
    setAttempt(0);
    setGuess("");
    setStatus("playing");
    setMessage("");
    setSuggestions([]);
    setRoundScore(MAX_POINTS);
    setWikiHint("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/hints/${encodeURIComponent(
          randomPlayer.name
        )}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch hint");
      }

      const data = await res.json();

      if (data?.hints?.length > 0) {
        setWikiHint(data.hints[0]);
      } else {
        setWikiHint(
          `This player represents ${randomPlayer.country} in international cricket.`
        );
      }
    } catch (err) {
      console.error("Hint fetch error:", err);
      setWikiHint(
        `This player represents ${randomPlayer.country} in international cricket.`
      );
    }
  };


  useEffect(() => {
    startGame();
  }, []);

  const getHints = () => {
    if (!selectedPlayer) return [];

    return [
      wikiHint,
      `🌍 This ${selectedPlayer.gender} cricketer represents ${selectedPlayer.country} and plays as a ${selectedPlayer.role}.`,
      selectedPlayer.playsIPL
        ? "🏏 This player has participated in the IPL."
        : "🏏 This player has NOT participated in the IPL.",
      `🧠 The name starts with "${selectedPlayer.name[0]}".`,
    ];
  };

  const hints = getHints();

  /* ================= GUESS LOGIC ================= */
  const handleGuess = () => {
    if (!guess.trim() || status !== "playing") return;

    if (
      guess.trim().toLowerCase() ===
      selectedPlayer.name.toLowerCase()
    ) {
      setScore((prev) => prev + roundScore);
      setStatus("win");
      setMessage(`🏆 Correct! You earned ${roundScore} points!`);
      setSuggestions([]);
      return;
    }

    const next = attempt + 1;
    setAttempt(next);
    setGuess("");
    setSuggestions([]);

    setRoundScore((prev) => (prev - 10 < 10 ? 10 : prev - 10));

    if (next >= MAX_ATTEMPTS) {
      setStatus("lose");
      setMessage(`❌ Answer was ${selectedPlayer.name}`);
    } else {
      setMessage("❌ Wrong! Next hint unlocked");
    }
  };

  if (!selectedPlayer) {
    return (
      <div className="page center">
        <p>Loading game…</p>
      </div>
    );
  }

  return (
    <div className="page center">
      <div className={`solo-card ${status}`}>
        <h2>🎯 Guess the Cricketer</h2>

        <h3>⭐ Total Score: {score}</h3>
        {status === "playing" && (
          <h4>🔥 Current Round Points: {roundScore}</h4>
        )}

        <div className="clue-box">
          {hints.slice(0, attempt + 1).map((hint, i) => (
            <p key={i}>🔍 {hint}</p>
          ))}
        </div>

        {status === "playing" && (
          <>
            <input
              placeholder="Type player name..."
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

            <button onClick={handleGuess}>Guess</button>
          </>
        )}

        <h3>{message}</h3>

        {(status === "win" || status === "lose") && (
          <button onClick={startGame}>🔁 Play Again</button>
        )}

        <div className="rules-box">
          <h4>📜 Game Rules</h4>
          <ul>
            <li>You get maximum 4 hints.</li>
            <li>Each round starts with 50 points.</li>
            <li>Each wrong guess reduces 10 points.</li>
            <li>Minimum points per round is 10.</li>
            <li>Total score keeps increasing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}