import React, { useState } from "react";
import "./ShareModal.css";

function ShareModal({
  show,
  onClose,
  guesses,
  mysteryPlayer,
  maxAttempts = 8,
}) {
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const guessedCorrectly = guesses.some(
    (player) => player.name === mysteryPlayer.name,
  );

  const yearDiff = (date1, date2) => {
    const y1 = new Date(date1).getFullYear();
    const y2 = new Date(date2).getFullYear();
    return Math.abs(y1 - y2);
  };

  const getPattern = () => {
    const fields = [
      "name",
      "nation",
      "role",
      "retired",
      "born",
      "battingHand",
      "totalMatches",
      "currentTeam",
    ];

    return guesses
      .map((player) =>
        fields
          .map((f) => {
            if (player[f] === mysteryPlayer[f]) return "🟩";
            if (f === "born" && yearDiff(player[f], mysteryPlayer[f]) <= 2)
              return "🟨";
            if (
              f === "totalMatches" &&
              Math.abs(player[f] - mysteryPlayer[f]) <= 5
            )
              return "🟨";
            return "⬛";
          })
          .join(""),
      )
      .join("\n");
  };

  const tries =
    guesses.find((g) => g.name === mysteryPlayer.name) === undefined
      ? "X"
      : guesses.length;

  const shareText = `Women's Cricket Wordle ${tries}/${maxAttempts}\n\n${getPattern()}\n\nCheck it out: https://cricwordle.github.io/ https://cricwordle.github.io/`;

  const copyToClipboard = () => {
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(textArea);
      setTimeout(() => setCopied(false), 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => setCopied(true))
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }

    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Share your score</h2>

        {guessedCorrectly ? (
          <p>🎉 Congratulations! You guessed correctly!</p>
        ) : (
          <p>❌ Better luck next time!</p>
        )}

        <p>
          The mystery player was: <strong>{mysteryPlayer.name}</strong>
        </p>

        <pre className="pattern">{shareText}</pre>
        <button
          className="share-main-btn"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: "Women's Cricket Wordle",
                  text: shareText,
                  url: window.location.href,
                })
                .catch((err) => console.error("Error sharing:", err));
            } else {
              copyToClipboard();
              alert("Sharing not supported on this device. Use the Copy Link button instead!");
            }
          }}
        >
          Share
        </button>
        <button
          onClick={copyToClipboard}
          className={`copy-btn ${copied ? "copied" : ""}`}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
}

export default ShareModal;
