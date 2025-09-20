import React, { useState, useEffect } from "react";
import "./ShareModal.css";
import Confetti from "react-confetti";

function ShareModal({
  show,
  onClose,
  guesses,
  mysteryPlayer,
  maxAttempts = 8,
  // onPlayAgain,
  gamesPlayed,
  maxGames,
  emojiPattern,
  timeUntilReset,
}) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasHitLimit = gamesPlayed >= maxGames;

  useEffect(() => {
    if (!show || guesses.length === 0) {
      setShowConfetti(false);
      return;
    }

    const lastGuess = guesses[guesses.length - 1];
    if (lastGuess.name === mysteryPlayer.name) {
      // ✅ Show confetti only if the most recent guess is correct
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 6000);
      return () => clearTimeout(timer);
    } else {
      // ❌ Hide confetti for wrong guesses
      setShowConfetti(false);
    }
  }, [show, guesses, mysteryPlayer.name]);

  if (!show) return null;

  const guessedCorrectly = guesses.some(
    (player) => player.name === mysteryPlayer.name
  );

  const yearDiff = (date1, date2) => {
    const y1 = new Date(date1).getFullYear();
    const y2 = new Date(date2).getFullYear();
    return Math.abs(y1 - y2);
  };
  const tries =
    guesses.find((g) => g.name === mysteryPlayer.name) === undefined
      ? "X"
      : guesses.length;

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = today.getFullYear();
  const dateString = `${day}/${month}/${year}`;

  const shareText = `Women's Cricket Wordle ${tries}/${maxAttempts}\n\n${dateString}\n\n${emojiPattern}\n\nhttps://cricwordle.github.io/`;

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
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        <h2>Share your score</h2>

        {guessedCorrectly ? (
          <p>🎉 Congratulations! You guessed correctly in {tries} {tries === 1 ? "move" : "moves"}!</p>
        ) : (
          <p>❌ Better luck next time!</p>
        )}

        <div>
          The mystery player was: <strong>{mysteryPlayer.name}</strong>
          {timeUntilReset && (
            <div
              style={{
                marginTop: "10px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              ⏳ New mystery player will be available in: {timeUntilReset}
            </div>
          )}
        </div>

        <pre className="pattern">{shareText}</pre>
        <button
          className="share-main-btn"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: "Women's Cricket Wordle",
                  text: shareText,
                })
                .catch((err) => console.error("Error sharing:", err));
            } else {
              copyToClipboard();
              alert(
                "Sharing not supported on this device. Use the Copy Link button instead!"
              );
            }
          }}
        >
          Share
        </button>
        {/* Play Again Button
        {!hasHitLimit ? (
          <button
            className="copy-btn"
            onClick={() => {
              if (gamesPlayed < maxGames) {
                onPlayAgain(); // resetGame from parent
                onClose(); // close modal
              }
            }}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Play Again
          </button>
        ) : (
          <p
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            🚫 You've hit today's max limit of {maxGames} games!
          </p>
        )} */}
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
