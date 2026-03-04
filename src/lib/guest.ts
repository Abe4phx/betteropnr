const AUTH_MODE_KEY = "auth_mode"; // "guest" | "user" | null

export function isGuest(): boolean {
  return localStorage.getItem(AUTH_MODE_KEY) === "guest";
}

export function enterGuest(): void {
  localStorage.setItem(AUTH_MODE_KEY, "guest");
}

export function exitGuest(): void {
  localStorage.removeItem(AUTH_MODE_KEY);
}
