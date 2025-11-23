import { players } from "../data/players.js";

/**
 * Simple deterministic hash
 */
function hashNumber(n) {
  let h = n;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return h >>> 0;
}

/**
 * Deterministically shuffle players using a FIXED SEED
 */
function shufflePlayers() {
  const seed = 123456; // constant, do NOT use year
  const arr = [...players];
  let h = seed;

  for (let i = arr.length - 1; i > 0; i--) {
    h = hashNumber(h + i);
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Convert local time → IST
 */
function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 330 * 60000);
}

/**
 * Get day of year in IST
 */
function getDayOfYearIST(ist) {
  const start = new Date(Date.UTC(ist.getUTCFullYear(), 0, 1, -5.5));
  return Math.floor((ist - start) / 86400000);
}

/**
 * Get consistent daily player (changes at 12 AM IST)
 */
export function getDailyPlayer() {
  const istNow = getISTDate();
  const dayOfYear = getDayOfYearIST(istNow);

  const sorted = shufflePlayers(); // always stable
  return sorted[dayOfYear % sorted.length];
}
