const AUTH_MODE_KEY = "auth_mode"; // "guest" | "user" | null
const STORAGE_LOGGER_FLAG = "__betteropnrAuthModeStorageLoggerInstalled";

type AuthModeValue = string | null;

function stack() {
  return new Error().stack;
}

function logAuthModeAccess(
  functionName: string,
  previousValue: AuthModeValue,
  nextValue: AuthModeValue,
) {
  console.log("[auth_mode]", functionName, {
    previousValue,
    nextValue,
    stack: stack(),
  });
}

function installAuthModeStorageLogger() {
  if (typeof window === "undefined") return;

  const target = window as typeof window & Record<string, boolean | undefined>;
  if (target[STORAGE_LOGGER_FLAG]) return;
  target[STORAGE_LOGGER_FLAG] = true;

  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;

  Storage.prototype.getItem = function patchedGetItem(key: string) {
    const value = originalGetItem.call(this, key);
    if (this === window.localStorage && key === AUTH_MODE_KEY) {
      logAuthModeAccess("localStorage.getItem(auth_mode)", value, value);
    }
    return value;
  };

  Storage.prototype.setItem = function patchedSetItem(key: string, value: string) {
    const previousValue =
      this === window.localStorage && key === AUTH_MODE_KEY
        ? originalGetItem.call(this, key)
        : null;

    originalSetItem.call(this, key, value);

    if (this === window.localStorage && key === AUTH_MODE_KEY) {
      logAuthModeAccess("localStorage.setItem(auth_mode)", previousValue, value);
    }
  };

  Storage.prototype.removeItem = function patchedRemoveItem(key: string) {
    const previousValue =
      this === window.localStorage && key === AUTH_MODE_KEY
        ? originalGetItem.call(this, key)
        : null;

    originalRemoveItem.call(this, key);

    if (this === window.localStorage && key === AUTH_MODE_KEY) {
      logAuthModeAccess("localStorage.removeItem(auth_mode)", previousValue, null);
    }
  };

  Storage.prototype.clear = function patchedClear() {
    const previousValue =
      this === window.localStorage
        ? originalGetItem.call(this, AUTH_MODE_KEY)
        : null;

    originalClear.call(this);

    if (this === window.localStorage && previousValue !== null) {
      logAuthModeAccess("localStorage.clear()", previousValue, null);
    }
  };
}

installAuthModeStorageLogger();

export function isGuest(): boolean {
  const previousValue = localStorage.getItem(AUTH_MODE_KEY);
  logAuthModeAccess("isGuest", previousValue, previousValue);
  return previousValue === "guest";
}

export function enterGuest(): void {
  const previousValue = localStorage.getItem(AUTH_MODE_KEY);
  localStorage.setItem(AUTH_MODE_KEY, "guest");
  // GUEST_MODE_PRECEDENCE: clear any stale native session tokens on the way
  // into guest mode so they can never be read back out as an authenticated
  // identity later. Only done here, on explicit guest entry — never during
  // normal authenticated operation.
  localStorage.removeItem("betteropnr_native_supabase_token");
  localStorage.removeItem("betteropnr_native_session_token");
  logAuthModeAccess("enterGuest", previousValue, "guest");
}

export function exitGuest(): void {
  const previousValue = localStorage.getItem(AUTH_MODE_KEY);
  localStorage.removeItem(AUTH_MODE_KEY);
  logAuthModeAccess("exitGuest", previousValue, null);
}
