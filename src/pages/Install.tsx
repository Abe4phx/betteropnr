import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, Check } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }
  }, []);

  const handleInstall = async () => {
    if (isInstallable) {
      const accepted = await promptInstall();
      if (accepted) {
        navigate("/");
      }
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Already Installed!</h1>
          <p className="text-muted-foreground mb-6">
            BetterOpnr is already installed on your device.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Open App
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-ts-coral to-ts-yellow rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold mb-3">Install BetterOpnr</h1>
          <p className="text-lg text-muted-foreground">
            Add BetterOpnr to your home screen for quick access and offline support
          </p>
        </div>

        {isInstallable && (
          <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-4">
              <Download className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Quick Install Available</h3>
                <p className="text-sm text-muted-foreground">
                  Click the button below to install instantly
                </p>
              </div>
              <Button onClick={handleInstall} size="lg">
                Install Now
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {platform === "ios" && (
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">iOS (iPhone/iPad)</h2>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>Open BetterOpnr in Safari browser</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Tap the Share button (square with arrow pointing up)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>Tap "Add" in the top right corner</span>
                </li>
              </ol>
            </Card>
          )}

          {platform === "android" && (
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">Android</h2>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>Open BetterOpnr in Chrome browser</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Tap the menu icon (three dots) in the top right</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Tap "Install app" or "Add to Home screen"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>Confirm by tapping "Install"</span>
                </li>
              </ol>
            </Card>
          )}

          {platform === "desktop" && (
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">Desktop</h2>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>Look for the install icon in your browser's address bar</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Click the install button</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Confirm installation in the popup</span>
                </li>
              </ol>
            </Card>
          )}

          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Benefits of Installing</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Quick access from your home screen</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Works offline with cached data</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Faster loading times</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Full-screen experience without browser UI</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
