import { useAuth } from "@clerk/clerk-react";
import { isGuest } from "@/lib/guest";
import Generator from "@/pages/Generator";
import Landing from "@/pages/Landing";

export function HomeOrGenerator() {
  const { isSignedIn } = useAuth();

  // Show Generator for authenticated users or guests
  if (isSignedIn || isGuest()) {
    return <Generator />;
  }

  // Show Landing for everyone else
  return <Landing />;
}
