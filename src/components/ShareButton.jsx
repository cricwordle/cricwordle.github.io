import React from "react";

function ShareButton({ guesses, mysteryPlayer }) {
  const generateEmojiGrid = () => {
    if (!guesses.length) return "";
    const fields = [
      "name",
      "role",
      "nation",
      "battingHand",
      "currentTeam",
      "retired",
      "born",
      "totalMatches",
    ];

    let grid = guesses
      .map((player) =>
        fields
          .map((field) => {
            const color = player.colors[field] || "grey";
            switch (color) {
              case "green":
                return "🟩";
              case "orange":
                return "🟨";
              case "grey":
                return "⬛";
              default:
                return "⬛";
            }
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
