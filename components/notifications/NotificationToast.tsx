"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";

type NotificationToastData = {
  id: string;
  message: string;
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState<NotificationToastData[]>([]);
  const { notifications } = useNotifications();

  // Garde en mÃ©moire les notifications dÃ©jÃ  affichÃ©es
  const displayedIds = useRef(new Set<string>());

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const newNotifications = notifications.filter(
      (notification) => !displayedIds.current.has(notification.id)
    );

    if (newNotifications.length === 0) {
      return;
    }

    newNotifications.forEach((notification) => {
      displayedIds.current.add(notification.id);

      const toast: NotificationToastData = {
        id: notification.id,
        message: notification.message,
      };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((item) => item.id !== notification.id)
        );
      }, 5000);
    });
  }, [notifications]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-4 shadow-xl animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl" aria-hidden="true">
              ðŸ””
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {toast.message}
              </p>

              <span className="text-xs text-gray-500">
                Maintenant
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setToasts((prev) =>
                  prev.filter((item) => item.id !== toast.id)
                );
              }}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Fermer la notification"
            >
              Ã—
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}