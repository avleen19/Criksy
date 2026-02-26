import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameCard from "../components/GameCard";

function updateStreak() {
  const today = new Date().toDateString();
  const lastPlayed = localStorage.getItem("lastPlayed");
  let streak = Number(localStorage.getItem("streak") || 0);

  if (lastPlayed !== today) {
    if (
      lastPlayed &&
      new Date(today) - new Date(lastPlayed) === 86400000
    ) {
      streak += 1;
    } else {
      streak = 1;
    }

    localStorage.setItem("streak", streak);
    localStorage.setItem("lastPlayed", today);
  }

  return streak;
}

export default function Home() {
  const navigate = useNavigate();
  const [fact, setFact] = useState("Loading cricket fact...");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(updateStreak());
  }, []);

useEffect(() => {
  const cricketFacts = [
    "Sachin Tendulkar is the only player with 100 international centuries.",
    "The first Cricket World Cup was held in 1975 in England.",
    "MS Dhoni is the only captain to win all three ICC trophies.",
    "Don Bradman’s Test batting average was 99.94.",
    "IPL is the richest cricket league in the world.",
    "India won the 1983 World Cup without a single helmet in the final.",
    "AB de Villiers once scored a 100 off just 31 balls in ODIs.",
    "Virat Kohli became the fastest player to reach 8,000–12,000 ODI runs.",
    "Ben Stokes played one of the greatest World Cup final innings in 2019.",
    "Rohit Sharma holds the record for the highest individual ODI score – 264.",
    "Muttiah Muralitharan has the most wickets in international cricket (1,347).",
    "Lasith Malinga is the only bowler to take 4 wickets in 4 balls in international cricket.",
    "Chris Gayle hit a six on the first ball of a Test match.",
    "Kane Williamson led NZ to their first ICC World Test Championship title.",
    "Mitchell Starc is the fastest to 200 ODI wickets."
  ];

  const randomFact =
    cricketFacts[Math.floor(Math.random() * cricketFacts.length)];

  setFact(`🏏 ${randomFact}`);
}, []);



return (
  <div className="home">
    <div className="container">
      <h1 className="home-title">Welcome to Criksy 🏏</h1>

      <p className="home-subtitle">
        Cricket games • Guessing • Multiplayer • Fun
      </p>

      {/* ===== DAILY FACT CARD ===== */}
      <div className="daily-fact-card">
        <h3>🏏 Daily Cricket Fact</h3>
        <p>{fact}</p>
        <span className="streak">
          🔥 Streak: {streak} day{streak > 1 ? "s" : ""}
        </span>
      </div>


      <button
        className="main-play-btn"
        onClick={() => navigate("/games")}
      >
        🚀 Start Playing
      </button>

      <div className="game-cards">
        <GameCard
          title="🎯 Guess Game"
          desc="Guess the cricketer using smart clues"
          onClick={() => navigate("/solo")}
        />

        <GameCard
          title="🟩 Grid Game"
          desc="Cricket grid challenge"
          onClick={() => navigate("/grid")}
        />

        <GameCard
          title="👥 Multiplayer"
          desc="Play live with friends and family"
          onClick={() => navigate("/lobby")}
        />
      </div>
    </div>
  </div>
);

}
