import React, { useState, useEffect } from "react";

export default function GuessInput({
  onGuess,
  players,
  value,
  setValue,
  inputRef,
  placeholder,
}) {
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Filter suggestions based on input
  useEffect(() => {
    if (!value) {
      setFilteredPlayers([]);
      setHighlightIndex(-1);
      return;
    }
    const filtered = players
      .filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
    setFilteredPlayers(filtered);
    if (filtered.length === 0) setHighlightIndex(-1);
  }, [value, players]);

  const handleSelect = (name) => {
    if (!name) return;
    onGuess(name.trim());
    setValue(""); // reset input
    setFilteredPlayers([]); // close autocomplete
    setHighlightIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        Math.min(prev + 1, filteredPlayers.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && filteredPlayers[highlightIndex]) {
        handleSelect(filteredPlayers[highlightIndex].name);
      } else {
        handleSelect(value);
      }
    }
  };

  return (
    <div className="sticky-input-wrapper">
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Guess the player"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="guess-input"
        />
        <button className="guess-button" onClick={() => handleSelect(value)}>
          Guess
        </button>
      </div>

      {filteredPlayers.length > 0 && (
        <ul
          className="autocomplete-list"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredPlayers.map((p, idx) => (
            <li
              key={p.name}
              className={`autocomplete-item ${highlightIndex === idx ? "highlighted" : ""}`}
              onMouseDown={() => handleSelect(p.name)}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
