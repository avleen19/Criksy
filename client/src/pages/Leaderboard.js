import React, { useEffect, useState, useCallback } from "react";
import socket from "../socket";
import { useUser } from "@clerk/clerk-react";

export default function Leaderboard({ refreshTrigger }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Use environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL || "https://criksy.onrender.com";

  // Fetch leaderboard from backend
  const fetchLeaderboard = useCallback(() => {
    if (!API_URL) {
      console.error("VITE_API_URL not set! Using fallback.");
      setLoading(false);
      return;
    }

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

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (refreshTrigger) fetchLeaderboard();
  }, [refreshTrigger, fetchLeaderboard]);

  // Listen to global leaderboard updates via Socket.io
  useEffect(() => {
    const handleGlobalLeaderboard = (updatedData) => setData(updatedData);
    socket.on("global-leaderboard", handleGlobalLeaderboard);

    return () => socket.off("global-leaderboard", handleGlobalLeaderboard);
  }, []);

  // Sort leaderboard by totalScore or score descending
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
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
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