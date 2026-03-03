// GUEST_DEBUG: Dev-only diagnostics panel for verifying guest limits end-to-end
// Toggle with Ctrl+Shift+G / Cmd+Shift+G. Never renders in production.

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { isGuest } from "@/lib/guest";
// GUEST_SELF_TEST: lazy import to keep bundle safe
import { runGuestSelfTest } from "@/utils/guestSelfTest";

const LS_KEYS = {
  serverRemaining: "betteropnr_guest_server_remaining",
  serverReset: "betteropnr_guest_server_reset_utc",
  runsUsed: "betteropnr_guest_runs_used",
  runsDate: "betteropnr_guest_runs_date",
};

function mask(val: string | null): string {
  if (!val || val.length < 10) return val ?? "—";
  return val.slice(0, 6) + "…" + val.slice(-4);
}

function readLS(key: string): string {
  try { return localStorage.getItem(key) ?? "—"; } catch { return "n/a"; }
}

interface Props {
  lastStatus: number | null;
  lastErrorCode: string | null;
  lastGuestLimits: { remainingRunsToday: number; resetDateUtc: string } | null;
  onResetCache: () => void;
  onSimulateExhausted: () => void;
}

export default function GuestDebugPanel({ lastStatus, lastErrorCode, lastGuestLimits, onResetCache, onSimulateExhausted }: Props) {
  const [visible, setVisible] = useState(false);
  const { user } = useUser();
  // GUEST_SELF_TEST: state for test results
  const [testResults, setTestResults] = useState<{ pass: boolean; checks: Array<{ name: string; pass: boolean; detail?: string }> } | null>(null);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "g") {
      e.preventDefault();
      setVisible(v => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!visible) return null;

  const guestId = (() => {
    try { return mask(localStorage.getItem("betteropnr_guest_id")); } catch { return "n/a"; }
  })();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 rounded-lg border border-border bg-background/95 backdrop-blur p-3 text-xs font-mono shadow-lg space-y-2 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="font-bold text-foreground">Guest Debug</span>
        <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground">
        <span>isAuthenticated</span><span className="text-foreground">{String(!!user)}</span>
        <span>isGuest</span><span className="text-foreground">{String(isGuest())}</span>
        <span>X-Guest-Id</span><span className="text-foreground">{guestId}</span>
        <span>Last status</span><span className="text-foreground">{lastStatus ?? "—"}</span>
        <span>Last error</span><span className="text-foreground">{lastErrorCode ?? "—"}</span>
      </div>

      <div className="border-t border-border pt-1 space-y-1">
        <span className="font-semibold text-foreground">Server guestLimits</span>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground">
          <span>remaining</span><span className="text-foreground">{lastGuestLimits?.remainingRunsToday ?? "—"}</span>
          <span>resetDate</span><span className="text-foreground">{lastGuestLimits?.resetDateUtc ?? "—"}</span>
        </div>
      </div>

      <div className="border-t border-border pt-1 space-y-1">
        <span className="font-semibold text-foreground">Local cache</span>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground">
          <span>server_remaining</span><span className="text-foreground">{readLS(LS_KEYS.serverRemaining)}</span>
          <span>server_reset</span><span className="text-foreground">{readLS(LS_KEYS.serverReset)}</span>
          <span>runs_used</span><span className="text-foreground">{readLS(LS_KEYS.runsUsed)}</span>
          <span>runs_date</span><span className="text-foreground">{readLS(LS_KEYS.runsDate)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1 border-t border-border">
        <button onClick={onResetCache} className="flex-1 rounded bg-muted px-2 py-1 text-foreground hover:bg-accent">Reset cache</button>
        <button onClick={onSimulateExhausted} className="flex-1 rounded bg-muted px-2 py-1 text-foreground hover:bg-accent">Simulate exhausted</button>
      </div>

      {/* GUEST_SELF_TEST: Run local assertions */}
      <div className="border-t border-border pt-1 space-y-1">
        <button
          onClick={() => setTestResults(runGuestSelfTest())}
          className="w-full rounded bg-muted px-2 py-1 text-foreground hover:bg-accent font-semibold"
        >
          Run Self-Test
        </button>
        {testResults && (
          <div className="space-y-1 mt-1">
            <span className={testResults.pass ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
              {testResults.pass ? "✓ ALL PASSED" : "✗ SOME FAILED"}
            </span>
            {testResults.checks.map((c, i) => (
              <div key={i} className="flex gap-1 text-muted-foreground">
                <span>{c.pass ? "✓" : "✗"}</span>
                <span className={c.pass ? "text-foreground" : "text-red-400"}>{c.name}</span>
                {c.detail && <span className="text-muted-foreground ml-auto">{c.detail}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
