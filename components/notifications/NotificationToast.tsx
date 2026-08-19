"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";

type NotificationToastData = {
  id: string;
  message: string;
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState<NotificationToastData[]>([]);
  const { notifications } = useNotifications();

  // Watch for new notifications from the context
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Check if we already have this notification in toasts
      if (!toasts.some((t) => t.id === latestNotification.id)) {
        const toast = {
          id: latestNotification.id,
          message: latestNotification.message,
        };

        setToasts((prev) => [...prev, toast]);

        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((item) => item.id !== toast.id));
        }, 5000);

        // Cleanup timer on unmount
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, toasts]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="w-80 max-w-[calc(100vw-2rem)] bg-white shadow-xl rounded-2xl p-4 animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">
              🔔
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {toast.message}
              </p>

              <span className="text-xs text-gray-500">
                Maintenant
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
