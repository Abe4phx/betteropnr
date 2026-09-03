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

  const openHostedEmailSignIn = () => {
    Browser.open({
      url: "https://accounts.betteropnr.com/sign-in?redirect_url=https%3A%2F%2Fbetteropnr.com%2Fauth-callback&after_sign_in_url=https%3A%2F%2Fbetteropnr.com%2Fauth-callback&after_sign_up_url=https%3A%2F%2Fbetteropnr.com%2Fauth-callback",
      presentationStyle: "fullscreen",
    });
  };

  useEffect(() => {
    const onRejection = (e: PromiseRejectionEvent) => {
      console.error("[SignIn:diag] unhandledrejection", e.reason);
    };
    const onError = (e: ErrorEvent) => {
      console.error(
        "[SignIn:diag] window.error",
        e.message,
        e.filename,
        e.lineno,
      );
    };
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    console.log(
      "[SignIn:diag] ClerkSignIn mounted, routing=" +
        (isNativeApp() ? "virtual" : "path"),
    );
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;
    const listener = CapApp.addListener("appUrlOpen", (event) => {
      console.log("[appUrlOpen] full URL:", event.url);
      if (event.url.startsWith("betteropnr://auth-callback")) {
        Browser.close();
        const raw = event.url;
        const qIdx = raw.indexOf("?");
        const hIdx = raw.indexOf("#");
        const search =
          qIdx !== -1 ? raw.slice(qIdx, hIdx !== -1 ? hIdx : undefined) : "";
        const hash = hIdx !== -1 ? raw.slice(hIdx) : "";

        const params = new URLSearchParams(search.slice(1));
        const sbt = params.get("__sbt");
        const st = params.get("__st");
        if (sbt) localStorage.setItem("betteropnr_native_supabase_token", sbt);
        if (st) localStorage.setItem("betteropnr_native_session_token", st);

        // Pass remaining Clerk params (e.g. __clerk_handshake) to sso-callback if present
        params.delete("__sbt");
        params.delete("__st");
        const remaining = params.toString();
        if (remaining || hash) {
          navigate(`/sso-callback${remaining ? "?" + remaining : ""}${hash}`, {
            replace: true,
          });
        } else {
          navigate("/generator", { replace: true });
        }
        return;
      }
    });
    return () => {
      listener.then((l) => l.remove());
    };
  }, [navigate]);

  const handleClickCapture = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("button");
    console.log(
      "[SignIn:diag] clickCapture tag=" +
        target.tagName +
        " text=" +
        (btn?.textContent?.trim().slice(0, 40) ??
          target.textContent?.trim().slice(0, 40)),
    );
    if (btn) {
      const emailInput = wrapperRef.current?.querySelector(
        'input[name="identifier"], input[type="email"], input[autocomplete="email"]',
      ) as HTMLInputElement | null;
      console.log(
        "[SignIn:diag] button clicked — email input value:",
        emailInput ? `"${emailInput.value}"` : "(input not found)",
      );
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

      {/* Web sign-in */}
      {!isNativeApp() && (
        <div className="flex flex-col items-center gap-4">
          <ClerkSignIn
            appearance={clerkAppearance}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl={from}
          />
          <Button
            variant="ghost"
            onClick={handleGuest}
            className="text-muted-foreground hover:text-foreground"
          >
            Continue as Guest
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Signing in is optional. You can continue as a guest.
          </p>
        </div>
      )}

      {/* Native sign-in */}
      {isNativeApp() && (
        <div className="flex flex-col items-center gap-4 w-full max-w-[340px] px-2 -mt-14">
          {/* overflow-hidden clips the gradient strip to the card's border radius */}
          <div className="w-full rounded-[1.75rem] bg-white overflow-hidden shadow-[0_4px_32px_rgba(255,107,107,0.14)] border border-border/30">
            <div className="h-[7px] bg-gradient-to-r from-[#FF6B6B] via-[#FF8E8E] to-[#FFB3B3]" />
            <div className="p-6 space-y-3">
              <div className="space-y-1 text-center pb-1">
                <h2 className="text-[20px] font-bold text-foreground tracking-tight">
                  Sign in to BetterOpnr
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  Welcome back! Please sign in to continue
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={openHostedEmailSignIn}
                className="w-full rounded-full h-12 text-[15px] font-medium relative bg-white border-border active:scale-[0.98] transition-transform"
              >
                <span className="absolute left-5 text-base">✉</span>
                Continue with Email
              </Button>
            </div>
          </div>

          <button
            onClick={handleGuest}
            className="text-sm text-[#FF6B6B] hover:text-[#FF6B6B]/80 font-medium py-1 transition-colors"
          >
            Continue as Guest
          </button>

          <p className="text-[11px] text-muted-foreground/70 text-center px-4">
            Signing in is optional. You can continue as a guest.
          </p>
        </div>
      )}
    </div>
  );
};

export default SignIn;
