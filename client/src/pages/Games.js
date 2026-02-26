import React from "react";
import { useNavigate } from "react-router-dom";
import GameCard from "../components/GameCard";

export default function Games() {
  const navigate = useNavigate();

  return (
    <div className="page center">
      

      <h1 className="home-title">Choose Your Game 🎮</h1>
      <p className="home-subtitle">
        Test your cricket knowledge, challenge your memory, and compete with friends!
      </p>


      <div className="game-info-bar">
        <div className="info-item">
          <h3>⚡ Fast Rounds</h3>
          <p>Quick & fun gameplay</p>
        </div>
        <div className="info-item">
          <h3>🏆 Score Points</h3>
          <p>Track your progress</p>
        </div>
        <div className="info-item">
          <h3>🔥 Daily Challenge</h3>
          <p>Keep your streak alive</p>
        </div>
      </div>


      <div className="game-cards">
        <GameCard
          title="🧠 Guess the Cricketer"
          desc="3 clues • 3 attempts • score points"
          onClick={() => navigate("/solo")}
        />

        <GameCard
          title="🧩 Grid Game"
          desc="Cricket grid challenge"
          onClick={() => navigate("/grid")}
        />

        <GameCard
          title="👥 Multiplayer"
          desc="Play live with friends and family"
          onClick={() => navigate("/lobby")}
        />
      </div>


      <div className="how-it-works">
        <h2>How It Works</h2>
        <ul>
          <li>🎯 Choose your game mode</li>
          <li>🧠 Use clues wisely</li>
          <li>🏆 Earn points & climb leaderboard</li>
          <li>🔥 Maintain your daily streak</li>
        </ul>
      </div>


      <p className="game-footer-text">
        Ready to prove you're a true cricket fan? 🚀
      </p>

    </div>
  );
}
