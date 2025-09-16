import React from "react";

function FeedbackTile({ label, value, mysteryValue }) {
  let tileClass = "tile tile-gray";
  let tooltip = `${label}: ${value}`;

  if (value === mysteryValue) {
    tileClass = "tile tile-green";
    tooltip = `${label}: Exact match!`;
  } else if (
    (label === "Born" &&
      Math.abs(
        new Date(value).getFullYear() - new Date(mysteryValue).getFullYear()
      ) <= 1) ||
    (label === "Total Matches" && Math.abs(value - mysteryValue) <= 5)
  ) {
    tileClass = "tile tile-yellow";
    tooltip = `${label}: Close match`;
  }

  return (
    <div className={tileClass} title={tooltip}>
      {value}
    </div>
  );
}

export default FeedbackTile;
