import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { useNavigate } from "react-router-dom";

export const ReminderBanner = () => {
  const { getExpiredReminders, dismissReminder } = useTalkSpark();
  const [expiredReminders, setExpiredReminders] = useState<ReturnType<typeof getExpiredReminders>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkReminders = () => {
      setExpiredReminders(getExpiredReminders());
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [getExpiredReminders]);

  if (expiredReminders.length === 0) return null;

  const reminder = expiredReminders[0];

  const handleGenerateFollowUp = () => {
    navigate('/');
    dismissReminder(reminder.id);
  };

  const handleDismiss = () => {
    dismissReminder(reminder.id);
  };

  return (
    <Card className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-primary mt-0.5 animate-pulse" />
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1">
            Ready to spark the next message?
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            It's been 24 hours since you saved "{reminder.text.substring(0, 50)}..."
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm"
              onClick={handleGenerateFollowUp}
              className="rounded-xl"
            >
              Generate Follow-Up
            </Button>
            <Button 
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDismiss}
          className="rounded-full h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};