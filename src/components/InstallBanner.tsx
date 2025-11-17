import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const InstallBanner = () => {
  const { isInstallable, promptInstall, dismissInstall } = useInstallPrompt();
  const navigate = useNavigate();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    await promptInstall();
  };

  const handleLearnMore = () => {
    navigate("/install");
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm p-4 shadow-lg border-primary/20 bg-card z-50">
      <button
        onClick={dismissInstall}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 bg-gradient-to-br from-ts-coral to-ts-yellow rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install BetterOpnr</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Add to your home screen for quick access
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              Install
            </Button>
            <Button onClick={handleLearnMore} variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
