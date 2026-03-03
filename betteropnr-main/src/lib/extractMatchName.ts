/**
 * Extracts the first name from profile text.
 * Looks for common patterns like "Name is X", "I'm X", "My name is X", etc.
 * Returns the first capitalized word if no pattern is found.
 */
export const extractMatchName = (profileText: string): string | undefined => {
  if (!profileText || profileText.trim().length === 0) {
    return undefined;
  }

  const text = profileText.trim();

  // Common patterns to look for
  const patterns = [
    /(?:name is|name's|i'm|im|i am|call me|this is)\s+([A-Z][a-z]+)/i,
    /^([A-Z][a-z]+)(?:\s|,|\.|!)/,  // First word if capitalized
    /\b([A-Z][a-z]+)\b/  // Any capitalized word
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
};
