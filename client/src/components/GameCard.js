import React from "react";

export default function GameCard({ title, desc, onClick, disabled }) {
  return (
    <div
      className={`game-card ${disabled ? "disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
