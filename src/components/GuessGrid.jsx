import React from "react";
import Flag from "react-world-flags";

function GuessGrid({ guesses, mysteryPlayer }) {
  if (!mysteryPlayer) return null;

  // Map nation names to flag emojis
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
    return map[nation] || null; // return null if not in the map
  };

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
            new Date(mysteryPlayer.born).getFullYear(),
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
            new Date(mysteryPlayer.born).getFullYear(),
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

  const renderCell = (guess, key, content) => {
    const tooltip = getTooltip(guess, key);
    return (
      <div
        className={`guess-cell flip ${getCellColor(guess, key)}`}
        {...(tooltip && { "data-tooltip": tooltip })}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="guess-grid-wrapper">
      <div className="guess-grid">
        {/* Header row */}
        <div className="guess-row header mobile-header">
          <div className="guess-cell">Player Name</div>
          <div className="guess-cell">Nation</div>
          <div className="guess-cell">Role</div>
          <div className="guess-cell">Retired?</div>
          <div className="guess-cell">Born</div>
          <div className="guess-cell">Batting Hand</div>
          <div className="guess-cell">Intl Matches</div>
          <div className="guess-cell"
          >WPL</div>
        </div>

        {/* Guesses */}
        {guesses.map((guess, index) => (
          <div key={index} className="guess-row">
            {renderCell(guess, "name", guess.name)}
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
            )}
            {renderCell(guess, "role", guess.role)}
            {renderCell(guess, "retired", guess.retired)}
            {renderCell(
              guess,
              "born",
              <>
                {new Date(guess.born).getFullYear()} {getBornArrow(guess)}
              </>,
            )}
            {renderCell(guess, "battingHand", guess.battingHand)}
            {renderCell(guess, "totalMatches", guess.totalMatches)}
            {renderCell(guess, "currentTeam", guess.currentTeam)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuessGrid;
