import React from "react";

function ShareButton({ guesses, mysteryPlayer }) {
  const generateEmojiGrid = () => {
    if (!guesses.length) return "";

    const fields = [
      "nation",
      "role",
      "retired",
      "born",
      "battingHand",
      "totalMatches",
      "currentTeam",
    ];

    let grid = guesses
      .map((player) =>
        fields
          .map((field) => {
            if (player[field] === mysteryPlayer[field]) return "🟩";
            if (player[field] !== mysteryPlayer[field]) return "🟨";
            return "⬜";
          })
          .join("")
      )
      .join("\n");

    return grid;
  };

  const handleShare = () => {
    const grid = generateEmojiGrid();
    if (!grid) return alert("No guesses yet!");

    const text = `Women's Cricket Wordle\n\n${grid}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert("Emoji grid copied to clipboard!");
    } else {
      alert("Clipboard not supported on this browser.");
    }
  };

  return <button onClick={handleShare}>Share Emoji Grid</button>;
}

export default ShareButton;
