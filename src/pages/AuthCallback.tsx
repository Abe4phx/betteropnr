import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    window.location.href = `betteropnr://auth-callback${search}${hash}`;
  }, []);

  const handleReturn = () => {
    const search = window.location.search;
    const hash = window.location.hash;
    window.location.href = `betteropnr://auth-callback${search}${hash}`;
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
