import express from "express";
import axios from "axios";
import HintCache from "../models/HintCache.js";

const router = express.Router();

function sanitizeWikiHint(text, playerName) {
  if (!text) return null;

  if (text.toLowerCase().includes("may refer to")) {
    return null;
  }

  let sentence = text.split(". ")[0];

  const nameParts = playerName.split(" ");
  nameParts.forEach((part) => {
    const regex = new RegExp(`\\b${part}\\b`, "gi");
    sentence = sentence.replace(regex, "");
  });

  if (sentence.toLowerCase().includes(" is ")) {
    sentence = sentence.replace(/^.*?\sis\s/i, "This player is ");
  } else {
    sentence = "This player is a professional cricketer.";
  }

  sentence = sentence.replace(/\s+/g, " ").trim();

  if (sentence.length < 25) {
    return "This player is an international cricketer.";
  }

  return sentence;
}

router.get("/:playerName", async (req, res) => {
  try {
    const { playerName } = req.params;

    // 1️⃣ CHECK CACHE FIRST
    const existing = await HintCache.findOne({ playerName });

    if (existing) {
      console.log("📦 Using cached hint");
      return res.json({ hints: existing.hints });
    }

    console.log("🌍 Fetching from Wikipedia...");

    const wikiRes = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(playerName)}`,
      {
        timeout: 5000,
        headers: {
          "User-Agent": "CricketGuessGame/1.0 (learning project)",
        },
      }
    );

    const extract = wikiRes.data.extract;

    if (!extract) {
      return res.json({ hints: [] });
    }

    const cleanHint = sanitizeWikiHint(extract, playerName);

    console.log("💾 Saving sanitized hint to MongoDB...");

    await HintCache.create({
      playerName,
      hints: [cleanHint],
    });

    console.log("✅ Saved successfully");

    res.json({ hints: [cleanHint] });

  } catch (error) {
    console.log("❌ ERROR:", error.message);
    res.status(500).json({ message: "Error fetching hints" });
  }
});

export default router;