import { players } from "../data/players.js";

/**
 * Returns a deterministic "daily" player that resets at 12:00 AM IST
 * for everyone worldwide.
 */
export function getDailyPlayer() {
  const now = new Date();

  // Shift current UTC time to IST (+5:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + IST_OFFSET);

  // Calculate day-of-year based on IST
  const startOfYearIST = new Date(Date.UTC(istNow.getUTCFullYear(), 0, 1));
  const diff = istNow - startOfYearIST;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use modulo to pick a player deterministically
  const index = dayOfYear % players.length;
  return players[index];
}
