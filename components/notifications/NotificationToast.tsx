"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type NotificationToastData = {
  id: string;
  message: string;
};

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<
    NotificationToastData[]
  >([]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  useEffect(() => {
    const handleNotification = (data: {
      message: string;
    }) => {
      const notification = {
        id: crypto.randomUUID(),
        message: data.message,
      };

      playNotificationSound();

      setNotifications((prev) => [
        ...prev,
        notification,
      ]);

      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter(
            (item) => item.id !== notification.id
          )
        );
      }, 5000);
    };

    socket.on(
      "notification:new",
      handleNotification
    );

    return () => {
      socket.off(
        "notification:new",
        handleNotification
      );
    };
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="w-80 max-w-[calc(100vw-2rem)] bg-white shadow-xl rounded-2xl p-4 animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">
              🔔
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
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