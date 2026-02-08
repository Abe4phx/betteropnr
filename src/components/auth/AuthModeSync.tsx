import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { exitGuest } from "@/lib/guest";

export function AuthModeSync() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) exitGuest();
  }, [isSignedIn]);

  return null;
}
