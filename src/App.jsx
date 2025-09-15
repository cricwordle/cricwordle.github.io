import React, { useState, useEffect, useRef } from "react";
import { players } from "./data/players.js";
import GuessInput from "./components/GuessInput.jsx";
import GuessGrid from "./components/GuessGrid.jsx";
import Confetti from "react-confetti";
import ShareModal from "./components/ShareModal.jsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const MAX_ATTEMPTS = 8;
const MAX_GAMES_PER_DAY = 3;
const DISABLE_LIMIT = false;

function App() {
  const [mysteryPlayer, setMysteryPlayer] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [guessInput, setGuessInput] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [hideLimitMessage, setHideLimitMessage] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem("gamesPlayed")) || {};
    setGamesPlayedToday(stored[today] || 0);
    pickRandomPlayer();
  }, []);

  useEffect(() => {
    if (DISABLE_LIMIT) return;
    const interval = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(
        2,
        "0",
      );
      const minutes = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      ).padStart(2, "0");
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(
        2,
        "0",
      );
      setTimeUntilReset(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pickRandomPlayer = () => {
    const randomIndex = Math.floor(Math.random() * players.length);
    setMysteryPlayer(players[randomIndex]);
  };

  const incrementGamesPlayed = () => {
    if (DISABLE_LIMIT) return;
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem("gamesPlayed")) || {};
    stored[today] = (stored[today] || 0) + 1;
    localStorage.setItem("gamesPlayed", JSON.stringify(stored));
    setGamesPlayedToday(stored[today]);
  };

  const annotateGuess = (player) => {
    const annotated = { ...player, colors: {} };
    const mystery = mysteryPlayer;

    annotated.colors.name = player.name === mystery.name ? "green" : "grey";
    annotated.colors.nation =
      player.nation === mystery.nation ? "green" : "grey";
    annotated.colors.role = player.role === mystery.role ? "green" : "grey";
    annotated.colors.retired =
      player.retired === mystery.retired ? "green" : "grey";
    annotated.colors.battingHand =
      player.battingHand === mystery.battingHand ? "green" : "grey";
    annotated.colors.currentTeam =
      player.currentTeam === mystery.currentTeam ? "green" : "grey";

    const bornDiff = Math.abs(
      new Date(player.born).getFullYear() -
        new Date(mystery.born).getFullYear(),
    );
    annotated.colors.born =
      bornDiff === 0 ? "green" : bornDiff <= 2 ? "orange" : "grey";

    const matchDiff = Math.abs(player.totalMatches - mystery.totalMatches);
    annotated.colors.totalMatches =
      matchDiff === 0 ? "green" : matchDiff <= 5 ? "orange" : "grey";

    return annotated;
  };

  const handleGuess = (guessName) => {
    // 🚨 Stop and show overlay if daily limit reached
    if (!DISABLE_LIMIT && gamesPlayedToday >= MAX_GAMES_PER_DAY) {
      setHideLimitMessage(false); // ensure overlay is visible again
      return;
    }

    const player = players.find(
      (p) => p.name.toLowerCase() === guessName.toLowerCase(),
    );
    if (!player) return alert("Player not found!");

    const annotatedPlayer = annotateGuess(player);
    const newGuesses = [...guesses, annotatedPlayer];
    setGuesses(newGuesses);
    setGuessInput("");

    if (player.name === mysteryPlayer.name) {
      setShowPlayer(true);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 5000);
      incrementGamesPlayed();
      setShowShare(true);
    } else if (newGuesses.length === MAX_ATTEMPTS) {
      setShowShare(true);
      incrementGamesPlayed();
    }
  };

  const handleSelectPlayer = (player) => {
    handleGuess(player.name);
  };

  if (!mysteryPlayer) return <div>Loading...</div>;

  const attemptsRemaining = MAX_ATTEMPTS - guesses.length;
  const limitReached =
    !DISABLE_LIMIT &&
    gamesPlayedToday >= MAX_GAMES_PER_DAY &&
    !hideLimitMessage;

  return (
    <div className="container">
      {celebrate && <Confetti />}

      {/* Top Bar: How to Play + Contact Us */}
      <div className="top-bar" style={{ justifyContent: "space-between" }}>
        <div>
          <button
            className="how-to-play-button"
            onClick={() => setShowHowToPlay(true)}
          >
            How to Play
          </button>
        </div>
        <div className="contact-us">
          <a href="https://www.instagram.com/wicket.wispers/" target="_blank">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://x.com/WicketWispers" target="_blank">
            <i className="fab fa-x-twitter"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/nikhil-n-g-48a7711a0/"
            target="_blank"
          >
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </div>

      {/* Title */}
      <h1>Women’s Cricket Wordle</h1>
      <h2 className="subtitle">Guess the International Cricketer</h2>

      {showHowToPlay && (
        <div
          className="overlay-message"
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="how-to-play-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>How to Play</h2>
            <ul>
              <li>
                Guess the mystery&nbsp;{" "}
                <strong> Women's Cricket Player!</strong>
              </li>
              <li>
                Type the player's name in the search box and click&nbsp;{" "}
                <strong>"Guess".</strong>
              </li>
              <li>
                You have <strong>&nbsp;8 attempts</strong>&nbsp;per game to
                guess correctly.
              </li>
              <li>
                Each guess will show hints on Nation, Role, Birth Year, etc.
              </li>
              <li>
                Hints:
                <span
                  style={{
                    backgroundColor: "#6aaa64",
                    color: "white",
                    padding: "2px 6px",
                    margin: "0 4px",
                    borderRadius: "4px",
                  }}
                >
                  Green = Correct
                </span>
                <span
                  style={{
                    backgroundColor: "#f39c12",
                    color: "white",
                    padding: "2px 6px",
                    margin: "0 4px",
                    borderRadius: "4px",
                  }}
                >
                  Orange = Close
                </span>
                <span
                  style={{
                    backgroundColor: "#787c7e",
                    color: "white",
                    padding: "2px 6px",
                    margin: "0 4px",
                    borderRadius: "4px",
                  }}
                >
                  Grey = Wrong
                </span>
              </li>
              <li style={{ color: "#555", fontStyle: "italic" }}>
                Disclaimer: For simplicity, not all current or retired players
                are included in the dataset. If you attempt to guess a player
                and the game does not accept the name, that player is not part
                of our dataset.
              </li>
            </ul>
            <button
              className="copy-button"
              onClick={() => setShowHowToPlay(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {limitReached ? (
        <div className="overlay-message">
          <div className="limit-content">
            <p className="limit-text">
              <strong>You've played {MAX_GAMES_PER_DAY} games today!</strong>
            </p>
            <p className="limit-text">
              Next mystery player will be available in:{" "}
              <strong>{timeUntilReset}</strong>
            </p>
            <button
              className="close-overlay-button"
              onClick={() => setHideLimitMessage(true)}
            >
              Close ✖
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="player-image-container">
            <img
              src={
                showPlayer
                  ? mysteryPlayer.image || "/images/silhouette.png"
                  : "/images/silhouette.png"
              }
              alt="Mystery Player"
              className="player-image"
            />
          </div>

          {!showPlayer && attemptsRemaining > 0 && !showShare && (
            <GuessInput
              onGuess={handleGuess}
              players={players}
              value={guessInput}
              setValue={setGuessInput}
              inputRef={inputRef}
              placeholder={`Guess ${guesses.length + 1} of ${MAX_ATTEMPTS}`}
            />
          )}

          <GuessGrid guesses={guesses} mysteryPlayer={mysteryPlayer} />

          {(showPlayer || guesses.length === MAX_ATTEMPTS) && (
            <div className="reveal-answer">
              {showPlayer ? (
                <>
                  You guessed it! The mystery player was:{" "}
                  <strong>{mysteryPlayer.name}</strong> (Born:{" "}
                  {new Date(mysteryPlayer.born).getFullYear()})
                </>
              ) : (
                <>
                  Better luck next time! The mystery player was:{" "}
                  <strong>{mysteryPlayer.name}</strong> (Born:{" "}
                  {new Date(mysteryPlayer.born).getFullYear()})
                </>
              )}
            </div>
          )}
        </>
      )}

      <button
        onClick={() => setShowShare(true)}
        style={{
          background: "linear-gradient(135deg, #3949ab, #5c6bc0)",
          color: "white",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.transform = "translateY(-2px)")
        }
        onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        Share my score
      </button>

      <ShareModal
        show={showShare}
        onClose={() => setShowShare(false)}
        guesses={guesses}
        mysteryPlayer={mysteryPlayer}
        maxAttempts={MAX_ATTEMPTS}
      />
      <footer
        style={{
          textAlign: "center",
          padding: "16px 8px",
          fontSize: "14px",
          color: "#555",
          lineHeight: "1.5",
        }}
      >
        <div>
          Inspired by{" "}
          <a
            href="https://stumple.me/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3949ab", textDecoration: "none" }}
          >
            Stumple
          </a>
          . Adapted for Women's Cricket.
        </div>
        <div style={{ fontWeight: "bold", marginTop: "4px" }}>
          Made by{" "}
          <a
            href="https://www.linkedin.com/in/nikhil-n-g-48a7711a0/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3949ab", textDecoration: "none" }}
          >
            Nikhil N G
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
