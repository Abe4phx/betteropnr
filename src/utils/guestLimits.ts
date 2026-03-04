// GUEST_UX_LIMITS: Client-side daily rate limiter for guest users (UX cache only; server is source of truth)

export const DAILY_LIMIT = 3;
export const OPENERS_PER_RUN = 2;

const DATE_KEY = "betteropnr_guest_runs_date";
const USED_KEY = "betteropnr_guest_runs_used";
// GUEST_LIMITS_SYNC: Server-synced keys (preferred over local counters when available)
const SERVER_RESET_KEY = "betteropnr_guest_server_reset_utc";
const SERVER_REMAINING_KEY = "betteropnr_guest_server_remaining";

// In-memory fallback when localStorage is unavailable
let memoryDate = "";
let memoryUsed = 0;

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

// GUEST_UX_LIMITS: Reset stored count if local date has changed
function resetIfNewDay(): void {
  const today = getTodayKey();
  if (isLocalStorageAvailable()) {
    if (localStorage.getItem(DATE_KEY) !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(USED_KEY, "0");
      // Clear stale server sync data
      localStorage.removeItem(SERVER_RESET_KEY);
      localStorage.removeItem(SERVER_REMAINING_KEY);
    }
  } else {
    if (memoryDate !== today) {
      memoryDate = today;
      memoryUsed = 0;
    }
  }
}

// GUEST_LIMITS_SYNC: Apply server-provided guestLimits to local state
export function syncFromServer(guestLimits: { remainingRunsToday: number; resetDateUtc: string }): number {
  const remaining = Math.max(0, Math.min(DAILY_LIMIT, guestLimits.remainingRunsToday));
  if (isLocalStorageAvailable()) {
    localStorage.setItem(SERVER_RESET_KEY, guestLimits.resetDateUtc);
    localStorage.setItem(SERVER_REMAINING_KEY, String(remaining));
    // Also sync the local counter so they stay consistent
    localStorage.setItem(USED_KEY, String(DAILY_LIMIT - remaining));
    localStorage.setItem(DATE_KEY, getTodayKey());
  } else {
    memoryUsed = DAILY_LIMIT - remaining;
    memoryDate = getTodayKey();
  }
  return remaining;
}

// GUEST_UX_LIMITS: Return current guest runs state
export function getGuestRunsState(): { date: string; used: number; remaining: number } {
  resetIfNewDay();
  const today = getTodayKey();

  // GUEST_LIMITS_SYNC: Prefer server-synced remaining if available and fresh
  if (isLocalStorageAvailable()) {
    const serverRemaining = localStorage.getItem(SERVER_REMAINING_KEY);
    if (serverRemaining !== null) {
      const r = parseInt(serverRemaining, 10);
      const used = DAILY_LIMIT - r;
      return { date: today, used, remaining: Math.max(0, r) };
    }
    const used = parseInt(localStorage.getItem(USED_KEY) ?? "0", 10);
    return { date: today, used, remaining: Math.max(0, DAILY_LIMIT - used) };
  }

  return { date: today, used: memoryUsed, remaining: Math.max(0, DAILY_LIMIT - memoryUsed) };
}

// GUEST_UX_LIMITS: Convenience check
export function canGuestGenerate(): boolean {
  return getGuestRunsState().remaining > 0;
}

// GUEST_UX_LIMITS: Increment used by 1 after successful generation (fallback when no server sync)
export function bumpGuestRunsUsed(): number {
  resetIfNewDay();

  if (isLocalStorageAvailable()) {
    let used = parseInt(localStorage.getItem(USED_KEY) ?? "0", 10);
    used = Math.min(used + 1, DAILY_LIMIT);
    localStorage.setItem(USED_KEY, String(used));
    // Clear server cache so next read uses local
    localStorage.removeItem(SERVER_REMAINING_KEY);
    return Math.max(0, DAILY_LIMIT - used);
  }

  memoryUsed = Math.min(memoryUsed + 1, DAILY_LIMIT);
  return Math.max(0, DAILY_LIMIT - memoryUsed);
}

// GUEST_UX_LIMITS: Force used to max (called on 429 GUEST_LIMIT_REACHED to sync with server)
export function setGuestRunsUsedToMax(): void {
  const today = getTodayKey();
  if (isLocalStorageAvailable()) {
    localStorage.setItem(DATE_KEY, today);
    localStorage.setItem(USED_KEY, String(DAILY_LIMIT));
    localStorage.setItem(SERVER_REMAINING_KEY, "0");
  } else {
    memoryDate = today;
    memoryUsed = DAILY_LIMIT;
  }
}

// Legacy aliases for backward compat
export const getGuestUsage = getGuestRunsState;
export const consumeGuestRun = bumpGuestRunsUsed;
