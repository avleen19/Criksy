import UserScore from "../models/UserScore.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserScore.aggregate([
      {
        $group: {
          _id: "$userId",
          username: { $first: "$username" },
          totalScore: { $sum: "$score" },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};