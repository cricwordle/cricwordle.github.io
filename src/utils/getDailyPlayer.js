import { players } from "../data/players.js";

// Simple hash function to shuffle the day number deterministically
function hashDay(n) {
  let h = n;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return h >>> 0;
}

/**
 * Returns a deterministic "daily" player that resets at 12:00 AM IST
 * worldwide, so everyone sees the same player.
 */
export function getDailyPlayer() {
  const now = new Date();

  // IST offset in milliseconds (+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  // Shift current UTC time to IST
  const istNow = new Date(now.getTime() + IST_OFFSET);

  // Start of the year in IST
  const startOfYearIST = new Date(Date.UTC(istNow.getUTCFullYear(), 0, 1));

  // Difference in ms since start of year IST
  const diff = istNow.getTime() - startOfYearIST.getTime();

  // Convert ms → days
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Deterministic hashed index
  const index = hashDay(dayOfYear) % players.length;

  return players[index];
}
