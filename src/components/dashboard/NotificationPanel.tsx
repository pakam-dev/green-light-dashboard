import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestNotificationPermission, isSubscribed } from "@/lib/onesignal";
import { toast } from "sonner";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const status = await isSubscribed();
      setSubscribed(status);
    };
    checkSubscription();
  }, [isOpen]);

  const handleEnableNotifications = async () => {
    setLoading(true);
    const success = await requestNotificationPermission();
    if (success) {
      setSubscribed(true);
      toast.success("Notifications enabled!", {
        description: "You will now receive push notifications",
      });
    } else {
      toast.error("Could not enable notifications", {
        description: "Please allow notifications in your browser settings",
      });
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border shadow-large md:absolute md:right-0 md:top-full md:mt-2 md:h-auto md:rounded-xl md:border animate-slide-up">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {!subscribed ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
                <BellOff className="h-8 w-8 text-accent-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-2">
                Enable Push Notifications
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Stay updated with real-time alerts and important updates
              </p>
              <Button onClick={handleEnableNotifications} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Enabling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </span>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                <Check className="h-4 w-4" />
                <span>Push notifications are enabled</span>
              </div>
              <div className="text-center py-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No new notifications
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
