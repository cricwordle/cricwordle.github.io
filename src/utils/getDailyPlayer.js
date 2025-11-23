import { players } from "../data/players.js";

/** 
 * Simple deterministic hash
 */
function hashDay(n) {
  let h = n;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return h >>> 0;
}

/**
 * Deterministically shuffle players based on seed
 */
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
 * Get current time as IST reliably (timezone independent).
 */
function getISTDate() {
  const now = new Date();
  const localOffsetMin = now.getTimezoneOffset();  // in minutes
  const IST_OFFSET_MIN = 330;                     // +5:30 IST
  return new Date(
    now.getTime() + (IST_OFFSET_MIN + localOffsetMin) * 60000
  );
}

/**
 * Get day-of-year in IST, starting from Jan 1 00:00 IST
 */
function getDayOfYearIST(istNow) {
  const IST_OFFSET_HOURS = -5.5; // to shift UTC midnight to IST midnight

  const startOfYearIST = new Date(
    Date.UTC(
      istNow.getUTCFullYear(),
      0,
      1,
      IST_OFFSET_HOURS         // moves UTC midnight to IST midnight
    )
  );

  const diff = istNow - startOfYearIST;
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneDay);
}

/**
 * Returns the deterministic "daily" player.
 * Resets at 12:00 AM IST for all users globally.
 */
export function getDailyPlayer() {
  const istNow = getISTDate();
  const dayOfYear = getDayOfYearIST(istNow);

  // Shuffle based on IST year (stable for whole year)
  const shuffled = shufflePlayers(istNow.getFullYear());

  return shuffled[dayOfYear % shuffled.length];
}
