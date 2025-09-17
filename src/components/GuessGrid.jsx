import React, { useEffect, useState } from "react";
import Flag from "react-world-flags";

function GuessGrid({ guesses, mysteryPlayer }) {
  if (!mysteryPlayer) return null;

  const getFlagCode = (nation) => {
    const map = {
      India: "IN",
      Australia: "AU",
      England: "GB",
      "South Africa": "ZA",
      Pakistan: "PK",
      "New Zealand": "NZ",
      "Sri Lanka": "LK",
      Bangladesh: "BD",
    };
    return map[nation] || null;
  };
  const bgColorMap = {
    green: "#6aaa64",
    orange: "#f39c12",
    grey: "#787c7e",
  };

  // 🔹 New state for flip animation
  const [revealingRow, setRevealingRow] = useState(null);

  useEffect(() => {
    if (guesses.length > 0) {
      const lastRowIndex = guesses.length - 1;
      setRevealingRow(lastRowIndex);

      // number of columns in this row
      const totalColumns = Object.keys(guesses[lastRowIndex]).length;
      const totalDuration = totalColumns * 150 + 600; // match CSS animation delay + duration

      const timeout = setTimeout(() => setRevealingRow(null), totalDuration);

      return () => clearTimeout(timeout);
    }
  }, [guesses]);

  const getBornArrow = (guess) => {
    const guessedYear = new Date(guess.born).getFullYear();
    const mysteryYear = new Date(mysteryPlayer.born).getFullYear();
    if (guessedYear === mysteryYear) return null;
    return guessedYear < mysteryYear ? (
      <span className="orange-up">↑</span>
    ) : (
      <span className="orange-down">↓</span>
    );
  };

  const getCellColor = (guess, key) => {
    if (guess.colors && guess.colors[key]) return guess.colors[key];
    switch (key) {
      case "name":
        return guess.name === mysteryPlayer.name ? "green" : "grey";
      case "nation":
        return guess.nation === mysteryPlayer.nation ? "green" : "grey";
      case "role":
        return guess.role === mysteryPlayer.role ? "green" : "grey";
      case "retired":
        return guess.retired === mysteryPlayer.retired ? "green" : "grey";
      case "battingHand":
        return guess.battingHand === mysteryPlayer.battingHand
          ? "green"
          : "grey";
      case "currentTeam":
        return guess.currentTeam === mysteryPlayer.currentTeam
          ? "green"
          : "grey";
      case "born": {
        const diff = Math.abs(
          new Date(guess.born).getFullYear() -
            new Date(mysteryPlayer.born).getFullYear()
        );
        if (diff === 0) return "green";
        if (diff <= 2) return "orange";
        return "grey";
      }
      case "totalMatches": {
        const diff = Math.abs(guess.totalMatches - mysteryPlayer.totalMatches);
        if (diff === 0) return "green";
        if (diff <= 5) return "orange";
        return "grey";
      }
      default:
        return "grey";
    }
  };

  const getTooltip = (guess, key) => {
    switch (key) {
      case "born": {
        const diff = Math.abs(
          new Date(guess.born).getFullYear() -
            new Date(mysteryPlayer.born).getFullYear()
        );
        return diff > 0 ? `Year difference: ${diff}` : null;
      }
      case "totalMatches": {
        const diff = Math.abs(guess.totalMatches - mysteryPlayer.totalMatches);
        return diff > 0 ? `Difference: ${diff}` : null;
      }
      default:
        return null;
    }
  };

  // 🔹 Updated renderCell for animation
  const renderCell = (guess, key, content, colIndex, rowIndex) => {
    const colorClass = getCellColor(guess, key);
    const tooltip = getTooltip(guess, key);

    return (
      <div
        className={`guess-cell flip ${revealingRow === rowIndex ? "revealing" : ""}`}
        style={{
          "--cell-index": colIndex,
          backgroundColor:
            key === "name" && window.innerWidth <= 600
              ? "#f0f0f0" // light grey for mobile
              : bgColorMap[colorClass],
        }}
        {...(tooltip && { "data-tooltip": tooltip })}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="guess-grid-wrapper">
      <div className="guess-grid">
        <div className="guess-row header mobile-header">
          <div className="guess-cell">Player Name</div>
          <div className="guess-cell">Nation</div>
          <div className="guess-cell">Role</div>
          <div className="guess-cell">Retired?</div>
          <div className="guess-cell">Born</div>
          <div className="guess-cell">Batting Hand</div>
          <div className="guess-cell">Intl Matches</div>
          <div className="guess-cell">WPL</div>
        </div>

        {guesses.map((guess, rowIndex) => (
          <div key={rowIndex} className="guess-row">
            {renderCell(guess, "name", guess.name, 0, rowIndex)}
            {renderCell(
              guess,
              "nation",
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  fontSize: "clamp(0.7rem, 2vw, 1rem)",
                  width: "100%",
                }}
              >
                {guess.nation === "West Indies" ? (
                  <img
                    src="images/west-indies.png"
                    alt="West Indies Flag"
                    style={{ width: "6vw", maxWidth: 40, height: "auto" }}
                  />
                ) : (
                  <Flag
                    code={getFlagCode(guess.nation)}
                    style={{ width: "6vw", maxWidth: 40, height: "auto" }}
                  />
                )}
                <span style={{ textAlign: "center", wordBreak: "break-word" }}>
                  {guess.nation}
                </span>
              </div>,
              1,
              rowIndex
            )}
            {renderCell(guess, "role", guess.role, 2, rowIndex)}
            {renderCell(guess, "retired", guess.retired, 3, rowIndex)}
            {renderCell(
              guess,
              "born",
              <>
                {new Date(guess.born).getFullYear()} {getBornArrow(guess)}
              </>,
              4,
              rowIndex
            )}
            {renderCell(guess, "battingHand", guess.battingHand, 5, rowIndex)}
            {renderCell(guess, "totalMatches", guess.totalMatches, 6, rowIndex)}
            {renderCell(guess, "currentTeam", guess.currentTeam, 7, rowIndex)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessGrid;
