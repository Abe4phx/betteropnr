import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { isGuest } from "@/lib/guest";

export function RequireAuthOrGuest({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const location = useLocation();

  if (isSignedIn || isGuest()) return <>{children}</>;

  return <Navigate to="/sign-in" state={{ from: location }} replace />;
}
