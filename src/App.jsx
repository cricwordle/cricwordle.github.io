import React, { useState, useEffect, useRef } from "react";
import { players } from "./data/players.js";
import GuessInput from "./components/GuessInput.jsx";
import GuessGrid from "./components/GuessGrid.jsx";
import Confetti from "react-confetti";
import ShareModal from "./components/ShareModal.jsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const MAX_ATTEMPTS = 8;
const MAX_GAMES_PER_DAY = 1;
const DISABLE_LIMIT = false;

const getContinent = (nation) => {
  const asia = [
    "India",
    "Pakistan",
    "Sri Lanka",
    "Bangladesh",
    "Afghanistan",
    "Nepal",
  ];
  const europe = ["England", "Ireland", "Scotland", "Netherlands"];
  const oceania = ["Australia", "New Zealand"];
  const africa = ["South Africa", "Zimbabwe"];
  const americas = ["West Indies", "USA"];

  if (asia.includes(nation)) return "Asia";
  if (europe.includes(nation)) return "Europe";
  if (oceania.includes(nation)) return "Oceania";
  if (africa.includes(nation)) return "Africa";
  if (americas.includes(nation)) return "Americas";
  return null;
};

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
  const [gamesPlayed, setGamesPlayed] = useState(0);

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
        "0"
      );
      const minutes = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(
        2,
        "0"
      );
      setTimeUntilReset(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const seen = localStorage.getItem("howToPlaySeen");
    if (!seen) {
      setShowHowToPlay(true);
    }
  }, []);

  // ---------------- Emoji Pattern Function ----------------
  const getEmojiPattern = () => {
    if (!guesses || guesses.length === 0) return "";

    return guesses
      .map((player) => {
        const keys = [
          "name",
          "role",
          "nation",
          "battingHand",
          "currentTeam",
          "retired",
          "born",
          "totalMatches",
        ];
        return keys
          .map((key) => {
            const color = player.colors[key];
            switch (color) {
              case "green":
                return "🟩";
              case "orange":
                return "🟨"; // better to use 🟨 instead of 🟧 for orange
              case "grey":
                return "⬛";
              default:
                return "⬛";
            }
          })
          .join("");
      })
      .join("\n");
  };

  const pickRandomPlayer = () => {
    // 🚫 Stop starting a 4th game if daily limit reached
    if (!DISABLE_LIMIT && gamesPlayedToday >= MAX_GAMES_PER_DAY) {
      setHideLimitMessage(false); // show overlay
      return; // prevent picking a new mystery player
    }
    const randomIndex = Math.floor(Math.random() * players.length);
    setMysteryPlayer(players[randomIndex]);
    setGuesses([]);
  };
  // Modify your existing resetGame
  const resetGame = () => {
    if (gamesPlayed >= MAX_GAMES_PER_DAY) {
      // Show max limit popup instead of resetting
      setShowShare(true); // Reopen the ShareModal with the limit message
      return;
    }

    // Increment games played
    setGamesPlayed((prev) => prev + 1);

    // ✅ Your existing logic (kept as-is)
    pickRandomPlayer(); // picks a new player and clears guesses
    setShowPlayer(false); // hide the previous answer
    setShowShare(false); // close share modal
    setCelebrate(false); // stop confetti
  };

  const incrementGamesPlayed = () => {
    if (DISABLE_LIMIT) return;
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem("gamesPlayed")) || {};
    stored[today] = (stored[today] || 0) + 1;
    localStorage.setItem("gamesPlayed", JSON.stringify(stored));
    setGamesPlayedToday(stored[today]);
  };

  // --- Role closeness check ---
  const isRoleClose = (guessRole, mysteryRole) => {
    if (!guessRole || !mysteryRole) return false;

    const g = guessRole.toLowerCase().trim();
    const m = mysteryRole.toLowerCase().trim();

    // Exact match handled elsewhere
    if (g === m) return false;

    // Extract main type
    const extractType = (role) => {
      if (role.includes("allrounder")) {
        return "allrounder";
      }

      if (role.includes("bowler")) {
        return "bowler";
      }

      if (role.includes("batter")) {
        return "batter";
      }
      return null;
    };

    const gType = extractType(g);
    const mType = extractType(m);

    if (gType && mType && gType === mType) {
      return true; // ORANGE
    }

    return false; // GREY
  };

  const annotateGuess = (player) => {
    const annotated = { ...player, colors: {}, tooltips: {} };
    const mystery = mysteryPlayer;

    annotated.colors.name = player.name === mystery.name ? "green" : "grey";

    // Nation coloring logic with continent hint
    if (player.nation === mystery.nation) {
      annotated.colors.nation = "green";
    } else {
      const guessContinent = getContinent(player.nation);
      const mysteryContinent = getContinent(mystery.nation);

      if (guessContinent && guessContinent === mysteryContinent) {
        annotated.colors.nation = "orange"; // same continent = close
        annotated.tooltips.nation = "Same continent";
      } else {
        annotated.colors.nation = "grey"; // completely different
      }
    }

    annotated.colors.retired =
      player.retired === mystery.retired ? "green" : "grey";
    annotated.colors.battingHand =
      player.battingHand === mystery.battingHand ? "green" : "grey";
    annotated.colors.currentTeam =
      player.currentTeam === mystery.currentTeam ? "green" : "grey";

    // Role coloring logic
    if (player.role === mystery.role) {
      annotated.colors.role = "green";
    } else if (isRoleClose(player.role, mystery.role)) {
      annotated.colors.role = "orange";
      annotated.tooltips.role = "Similar role";
    } else {
      annotated.colors.role = "grey";
    }

    const bornDiff = Math.abs(
      new Date(player.born).getFullYear() - new Date(mystery.born).getFullYear()
    );
    annotated.colors.born =
      bornDiff === 0 ? "green" : bornDiff <= 2 ? "orange" : "grey";
    if (bornDiff <= 2 && bornDiff !== 0)
      annotated.tooltips.born = "Within 2 years";

    const matchDiff = Math.abs(player.totalMatches - mystery.totalMatches);
    annotated.colors.totalMatches =
      matchDiff === 0 ? "green" : matchDiff <= 5 ? "orange" : "grey";
    if (matchDiff <= 5 && matchDiff !== 0)
      annotated.tooltips.totalMatches = "Within 5 matches";
    return annotated;
  };

  const handleGuess = (guessName) => {
    // 🚨 Stop and show overlay if daily limit reached
    if (
      !DISABLE_LIMIT &&
      gamesPlayedToday >= MAX_GAMES_PER_DAY &&
      guesses.length === 0
    ) {
      setHideLimitMessage(false); // ensure overlay is visible again
      return;
    }

    const player = players.find(
      (p) => p.name.toLowerCase() === guessName.toLowerCase()
    );
    if (!player) return alert("Player not found!");

    const annotatedPlayer = annotateGuess(player);
    const newGuesses = [...guesses, annotatedPlayer];
    setGuesses(newGuesses);
    // 🟢 Hide mobile keyboard
    if (inputRef.current) inputRef.current.blur();
    // 🟢 Scroll latest guess into view
    const lastRow = document.querySelector(".guess-row:last-child");
    if (lastRow)
      lastRow.scrollIntoView({ behavior: "smooth", block: "center" });
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
    guesses.length === 0 &&
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
              onClick={() => {
                setShowHowToPlay(false);
                localStorage.setItem("howToPlaySeen", "true");
              }}
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
              <strong>Great job! You've completed today's challenge.</strong>
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

      {(showPlayer || guesses.length === MAX_ATTEMPTS) && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "8px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setShowShare(true)}
            style={{
              flex: "0 1 140px",
              padding: "12px 0",
              fontSize: "14px",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #3949ab, #5c6bc0)",
              color: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            Share my score
          </button>

          {/* <button
            onClick={resetGame}
            style={{
              flex: "0 1 140px", // make same width as share button
              padding: "8px 0",
              fontSize: "14px",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #43a047, #66bb6a)",
              color: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            Play Again
          </button> */}
        </div>
      )}

      <ShareModal
        show={showShare}
        onClose={() => setShowShare(false)}
        guesses={guesses}
        mysteryPlayer={mysteryPlayer}
        maxAttempts={MAX_ATTEMPTS}
        onPlayAgain={resetGame}
        gamesPlayed={gamesPlayed}
        maxGames={MAX_GAMES_PER_DAY}
        emojiPattern={getEmojiPattern()}
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
