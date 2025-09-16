// Handles the 24-hour cooldown after max attempts or correct guess

export function canGuessToday() {
  const lastGuessTime = localStorage.getItem("lastGuessTime");
  if (!lastGuessTime) return true;

  const now = new Date();
  const nextAvailableTime = new Date(lastGuessTime);
  const diff = now - nextAvailableTime;

  return diff >= 24 * 60 * 60 * 1000; // 24 hours
}

export function recordGuessTime() {
  localStorage.setItem("lastGuessTime", new Date().toISOString());
}

export function timeLeftMs() {
  const lastGuessTime = localStorage.getItem("lastGuessTime");
  if (!lastGuessTime) return 0;
  const now = new Date();
  const nextAvailableTime = new Date(
    new Date(lastGuessTime).getTime() + 24 * 60 * 60 * 1000
  );
  const diff = nextAvailableTime - now;
  return diff > 0 ? diff : 0;
}
