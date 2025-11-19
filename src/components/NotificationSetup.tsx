import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from "@/lib/notifications";

export const NotificationSetup = () => {
  const [permission, setPermission] = useState(getNotificationPermissionStatus());
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      
      if (result.granted) {
        toast.success('Notifications enabled! You\'ll get reminders for follow-ups.');
      } else if (result.denied) {
        toast.error('Notifications blocked. Enable them in your browser settings to get reminders.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    } finally {
      setIsRequesting(false);
    }
  };

  if (permission.granted) {
    return (
      <Card className="p-4 bg-gradient-subtle border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              Notifications Enabled
            </h3>
            <p className="text-xs text-muted-foreground">
              You'll get reminders for your saved follow-ups
            </p>
          </div>
          <Bell className="w-5 h-5 text-primary" />
        </div>
      </Card>
    );
  }

  if (permission.denied) {
    return (
      <Card className="p-4 bg-muted/50 border-muted">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-muted-foreground" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Notifications Blocked
            </h3>
            <p className="text-xs text-muted-foreground">
              Enable in browser settings to get reminders
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-subtle border-border">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Get Reminder Notifications
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Never miss a follow-up! Get notified when it's time to message your match.
          </p>
          <Button
            size="sm"
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="rounded-xl"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
