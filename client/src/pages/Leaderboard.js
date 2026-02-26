import React, { useEffect, useState, useCallback } from "react";
import socket from "../socket";
import { useUser } from "@clerk/clerk-react";

export default function Leaderboard({ refreshTrigger }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Use dynamic API URL based on environment
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchLeaderboard = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/api/leaderboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leaderboard fetch error:", err);
        setLoading(false);
      });
  }, [API_URL]);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Refetch if refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) fetchLeaderboard();
  }, [refreshTrigger, fetchLeaderboard]);

  // Listen to real-time global leaderboard via socket
  useEffect(() => {
    const handleGlobalLeaderboard = (updatedData) => setData(updatedData);
    socket.on("global-leaderboard", handleGlobalLeaderboard);
    return () => socket.off("global-leaderboard", handleGlobalLeaderboard);
  }, []);

  // Sort leaderboard descending
  const sortedData = [...data].sort(
    (a, b) => (b.totalScore || b.score) - (a.totalScore || a.score)
  );

  return (
    <div className="page center">
      <h2>🏆 Global Leaderboard</h2>

      {loading && <p>Loading...</p>}
      {!loading && sortedData.length === 0 && <p>No scores yet</p>}

      {!loading &&
        sortedData.map((userData, i) => {
          let medal = "";
          if (i === 0) medal = "🥇";
          else if (i === 1) medal = "🥈";
          else if (i === 2) medal = "🥉";

          const isMe = user?.id === userData.userId || user?.id === userData._id;

          return (
            <p
              key={userData._id || i}
              style={{
                fontWeight: isMe ? "bold" : "normal",
                color: isMe ? "#00e5ff" : "white",
              }}
            >
              {medal} #{i + 1} <b>{userData.username}</b> —{" "}
              {userData.totalScore || userData.score} pts
            </p>
          );
        })}
    </div>
  );
}