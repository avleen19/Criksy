import React, { useEffect, useState, useCallback } from "react";
import socket from "../socket";
import { useUser } from "@clerk/clerk-react";

export default function Leaderboard({ refreshTrigger }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchLeaderboard = useCallback(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/leaderboard")
      .then(res => res.json())
      .then(resData => { setData(resData); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
  useEffect(() => { if (refreshTrigger) fetchLeaderboard(); }, [refreshTrigger, fetchLeaderboard]);

  useEffect(() => {
    const handleGlobalLeaderboard = (updatedData) => setData(updatedData);
    socket.on("global-leaderboard", handleGlobalLeaderboard);
    return () => socket.off("global-leaderboard", handleGlobalLeaderboard);
  }, []);

  const sortedData = [...data].sort(
    (a, b) => (b.totalScore || b.score) - (a.totalScore || a.score)
  );

  return (
    <div className="page center">
      <h2>🏆 Global Leaderboard</h2>

      {loading && <p>Loading...</p>}
      {!loading && sortedData.length === 0 && <p>No scores yet</p>}

      {!loading && sortedData.map((userData, i) => {
        let medal = "";
        if (i === 0) medal = "🥇";
        if (i === 1) medal = "🥈";
        if (i === 2) medal = "🥉";

        const isMe = user?.id === userData._id;

        return (
          <p
            key={userData._id || i}
            style={{
              fontWeight: isMe ? "bold" : "normal",
              color: isMe ? "#00e5ff" : "white"
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