import { players } from "../data/players.js";

// Same hash function for deterministic mixing
function hashDay(n) {
  let h = n;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return h >>> 0;
}

// Deterministic shuffle of players for the given year
function shufflePlayers(seed) {
  const arr = [...players];
  let h = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    h = hashDay(h + i);
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns a deterministic "daily" player that resets at 12:00 AM IST
 * worldwide, so everyone sees the same player.
 * No repeats until all players have appeared.
 */
export function getDailyPlayer() {
  const now = new Date();

  // IST offset in milliseconds (+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  // Shift current UTC time to IST
  const istNow = new Date(now.getTime() + IST_OFFSET);

  // Start of the year in IST (midnight IST)
  const startOfYearIST = new Date(
    Date.UTC(istNow.getUTCFullYear(), 0, 1) - IST_OFFSET
  );

  // Difference in ms since start of year IST
  const diff = istNow.getTime() - startOfYearIST.getTime();

  // Convert ms → days
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Shuffle once per year, pick today's player
  const shuffled = shufflePlayers(istNow.getUTCFullYear());
  return shuffled[dayOfYear % shuffled.length];
}
