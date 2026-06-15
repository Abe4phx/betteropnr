import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const autoFired = useRef(false);

  const buildDeepLink = async () => {
    const search = window.location.search;
    const hash = window.location.hash;

    if (isSignedIn) {
      const supabaseToken = await getToken({ template: "supabase" }).catch(() => null);
      const sessionToken  = await getToken().catch(() => null);
      const params = new URLSearchParams(search.slice(1));
      if (supabaseToken) params.set("__sbt", supabaseToken);
      if (sessionToken)  params.set("__st",  sessionToken!);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return `betteropnr://auth-callback${qs}${hash}`;
    }

    return `betteropnr://auth-callback${search}${hash}`;
  };

  useEffect(() => {
    if (!isLoaded || autoFired.current) return;
    autoFired.current = true;
    buildDeepLink().then((url) => { window.location.href = url; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const handleReturn = () => {
    buildDeepLink().then((url) => { window.location.href = url; });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Returning to BetterOpnr…</p>
        <Button variant="outline" onClick={handleReturn}>
          Return to BetterOpnr
        </Button>
      </div>
    </div>
  );
};

export default AuthCallback;
