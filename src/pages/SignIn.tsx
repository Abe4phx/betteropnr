import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Browser } from "@capacitor/browser";
import { App as CapApp } from "@capacitor/app";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Spark } from "@/components/ui/Spark";
import { Button } from "@/components/ui/button";
import { enterGuest } from "@/lib/guest";
import { isNativeApp } from "@/lib/platformDetection";

const clerkAppearance = {
  elements: {
    rootBox: "mx-auto",
    card: "shadow-elegant rounded-3xl border-0",
    headerTitle: "font-heading font-bold",
    headerSubtitle: "text-muted-foreground",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 rounded-2xl transition-all duration-200 hover:scale-[1.02]",
    footerActionLink: "text-primary hover:text-primary/80",
    formFieldInput: "rounded-xl border-border focus:ring-secondary",
    formFieldLabel: "text-foreground font-medium",
    identityPreviewEditButton: "text-primary",
    otpCodeFieldInput: "rounded-xl border-border",
  },
  layout: {
    logoPlacement: "inside" as const,
  },
  variables: {
    colorPrimary: "#FF6B6B",
    colorText: "#0F1222",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F1222",
    borderRadius: "1rem",
  },
};

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/generator";
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onRejection = (e: PromiseRejectionEvent) => {
      console.error("[SignIn:diag] unhandledrejection", e.reason);
    };
    const onError = (e: ErrorEvent) => {
      console.error("[SignIn:diag] window.error", e.message, e.filename, e.lineno);
    };
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    console.log("[SignIn:diag] ClerkSignIn mounted, routing=" + (isNativeApp() ? "virtual" : "path"));
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;
    const listener = CapApp.addListener("appUrlOpen", (event) => {
      console.log("[appUrlOpen] full URL:", event.url);
      if (event.url.startsWith("betteropnr://auth-callback")) {
        Browser.close();
        navigate("/generator", { replace: true });
        return;
      }
    });
    return () => { listener.then((l) => l.remove()); };
  }, [navigate]);

  const handleClickCapture = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("button");
    console.log("[SignIn:diag] clickCapture tag=" + target.tagName + " text=" + (btn?.textContent?.trim().slice(0, 40) ?? target.textContent?.trim().slice(0, 40)));
    if (btn) {
      const emailInput = wrapperRef.current?.querySelector(
        'input[name="identifier"], input[type="email"], input[autocomplete="email"]'
      ) as HTMLInputElement | null;
      console.log("[SignIn:diag] button clicked — email input value:", emailInput ? `"${emailInput.value}"` : "(input not found)");
    }
  };

  const handleSubmitCapture = () => {
    console.log("[SignIn:diag] form submit fired (capture phase)");
  };

  const handleGuest = () => {
    enterGuest();
    navigate("/generator", { replace: true });
  };

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden"
      onClickCapture={handleClickCapture}
      onSubmitCapture={handleSubmitCapture}
    >
      {/* Decorative floating sparks */}
      <Spark
        className="absolute top-20 right-20 pointer-events-none hidden md:block"
        animate="drift"
        duration={6}
        size={32}
      />
      <Spark
        className="absolute bottom-32 left-24 pointer-events-none hidden md:block"
        animate="float"
        duration={7}
        size={28}
      />

      <div className="flex flex-col items-center gap-4">
        {isNativeApp() ? (
          <ClerkSignIn
            appearance={clerkAppearance}
            routing="virtual"
          />
        ) : (
          <ClerkSignIn
            appearance={clerkAppearance}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl={from}
          />
        )}

        {/* Guest button */}
        <Button
          variant="ghost"
          onClick={handleGuest}
          className="text-muted-foreground hover:text-foreground"
        >
          Continue as Guest
        </Button>

        {isNativeApp() && (
          <Button
            variant="outline"
            onClick={() =>
              Browser.open({
                url: "https://accounts.betteropnr.com/sign-in?redirect_url=https%3A%2F%2Fbetteropnr.com%2Fauth-callback",
                presentationStyle: "popover",
              })
            }
          >
            Sign In (Hosted)
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Signing in is optional. You can continue as a guest.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
