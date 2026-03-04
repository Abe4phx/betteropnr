// GUEST_SELF_TEST: Dev-only local assertions for guest limit logic
// No network requests, no destructive actions, no production impact

import { getGuestRunsState, syncFromServer, DAILY_LIMIT } from "./guestLimits";

interface CheckResult {
  name: string;
  pass: boolean;
  detail?: string;
}

interface SelfTestResult {
  pass: boolean;
  checks: CheckResult[];
}

export function runGuestSelfTest(): SelfTestResult {
  const checks: CheckResult[] = [];

  // 1) Guest ID exists and is stable
  try {
    const id1 = localStorage.getItem("betteropnr_guest_id");
    const id2 = localStorage.getItem("betteropnr_guest_id");
    const exists = typeof id1 === "string" && id1.length > 0;
    checks.push({ name: "Guest ID exists", pass: exists, detail: exists ? `len=${id1!.length}` : "missing" });
    checks.push({ name: "Guest ID stable across reads", pass: id1 === id2 });
  } catch (e) {
    checks.push({ name: "Guest ID access", pass: false, detail: String(e) });
  }

  // 2) Local cache keys parse without throwing
  try {
    const keys = [
      "betteropnr_guest_server_remaining",
      "betteropnr_guest_server_reset_utc",
      "betteropnr_guest_runs_used",
      "betteropnr_guest_runs_date",
    ];
    let allOk = true;
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v !== null && k.includes("remaining") || k.includes("used")) {
        const n = parseInt(v ?? "", 10);
        if (v !== null && isNaN(n)) { allOk = false; break; }
      }
    }
    checks.push({ name: "Cache keys parse cleanly", pass: allOk });
  } catch (e) {
    checks.push({ name: "Cache keys parse cleanly", pass: false, detail: String(e) });
  }

  // 3) Remaining runs clamp 0..DAILY_LIMIT
  try {
    const state = getGuestRunsState();
    const clamped = state.remaining >= 0 && state.remaining <= DAILY_LIMIT;
    checks.push({ name: `Remaining clamped 0..${DAILY_LIMIT}`, pass: clamped, detail: `remaining=${state.remaining}` });
  } catch (e) {
    checks.push({ name: "Remaining clamp check", pass: false, detail: String(e) });
  }

  // 4) syncFromServer clamps correctly
  try {
    // Save current state
    const savedRemaining = localStorage.getItem("betteropnr_guest_server_remaining");
    const savedReset = localStorage.getItem("betteropnr_guest_server_reset_utc");
    const savedUsed = localStorage.getItem("betteropnr_guest_runs_used");
    const savedDate = localStorage.getItem("betteropnr_guest_runs_date");

    // Test with out-of-range value
    const r1 = syncFromServer({ remainingRunsToday: 999, resetDateUtc: "2099-01-01" });
    const clampHigh = r1 <= DAILY_LIMIT;

    const r2 = syncFromServer({ remainingRunsToday: -5, resetDateUtc: "2099-01-01" });
    const clampLow = r2 >= 0;

    // Restore state
    const restore = (k: string, v: string | null) => v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
    restore("betteropnr_guest_server_remaining", savedRemaining);
    restore("betteropnr_guest_server_reset_utc", savedReset);
    restore("betteropnr_guest_runs_used", savedUsed);
    restore("betteropnr_guest_runs_date", savedDate);

    checks.push({ name: "syncFromServer clamps high", pass: clampHigh, detail: `sync(999)=${r1}` });
    checks.push({ name: "syncFromServer clamps low", pass: clampLow, detail: `sync(-5)=${r2}` });
  } catch (e) {
    checks.push({ name: "syncFromServer clamp", pass: false, detail: String(e) });
  }

  // 5) Day-change simulation: writing a stale date resets on next read
  try {
    const savedDate = localStorage.getItem("betteropnr_guest_runs_date");
    const savedUsed = localStorage.getItem("betteropnr_guest_runs_used");
    const savedRemaining = localStorage.getItem("betteropnr_guest_server_remaining");

    localStorage.setItem("betteropnr_guest_runs_date", "1999-01-01");
    localStorage.setItem("betteropnr_guest_runs_used", "99");
    localStorage.removeItem("betteropnr_guest_server_remaining");

    const state = getGuestRunsState();
    const reset = state.used === 0 && state.remaining === DAILY_LIMIT;

    // Restore
    const restore = (k: string, v: string | null) => v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
    restore("betteropnr_guest_runs_date", savedDate);
    restore("betteropnr_guest_runs_used", savedUsed);
    restore("betteropnr_guest_server_remaining", savedRemaining);

    checks.push({ name: "Day-change resets counter", pass: reset, detail: `used=${state.used} remaining=${state.remaining}` });
  } catch (e) {
    checks.push({ name: "Day-change reset", pass: false, detail: String(e) });
  }

  const pass = checks.every((c) => c.pass);
  return { pass, checks };
}
