// GUEST_LIMITS: Client-side daily rate limiter for guest users

export const DAILY_LIMIT = 3;
export const OPENERS_PER_RUN = 2;

const DATE_KEY = "betteropnr_guest_limit_date";
const COUNT_KEY = "betteropnr_guest_limit_count";

// In-memory fallback when localStorage is unavailable
let memoryDate = "";
let memoryCount = 0;

function isLocalStorageAvailable(): boolean {
  try {
    const t = "__ls_test__";
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getGuestUsage(): { date: string; count: number; remaining: number } {
  const today = getTodayKey();

  if (isLocalStorageAvailable()) {
    const storedDate = localStorage.getItem(DATE_KEY) ?? "";
    let count = parseInt(localStorage.getItem(COUNT_KEY) ?? "0", 10);

    if (storedDate !== today) {
      // GUEST_LIMITS: Reset on new day
      count = 0;
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(COUNT_KEY, "0");
    }

    return { date: today, count, remaining: Math.max(0, DAILY_LIMIT - count) };
  }

  // Fallback: in-memory
  if (memoryDate !== today) {
    memoryDate = today;
    memoryCount = 0;
  }
  return { date: today, count: memoryCount, remaining: Math.max(0, DAILY_LIMIT - memoryCount) };
}

export function canGuestGenerate(): boolean {
  return getGuestUsage().remaining > 0;
}

export function consumeGuestRun(): number {
  const today = getTodayKey();

  if (isLocalStorageAvailable()) {
    const storedDate = localStorage.getItem(DATE_KEY) ?? "";
    let count = parseInt(localStorage.getItem(COUNT_KEY) ?? "0", 10);
    if (storedDate !== today) {
      count = 0;
      localStorage.setItem(DATE_KEY, today);
    }
    count += 1;
    localStorage.setItem(COUNT_KEY, String(count));
    return Math.max(0, DAILY_LIMIT - count);
  }

  if (memoryDate !== today) {
    memoryDate = today;
    memoryCount = 0;
  }
  memoryCount += 1;
  return Math.max(0, DAILY_LIMIT - memoryCount);
}
