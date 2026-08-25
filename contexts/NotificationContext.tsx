"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { notificationSound } from "@/lib/sounds";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  entityId?: string | null;
  entityType?: string | null;
};

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationIds?: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationIds: string[]) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from API
  const refreshNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        console.error("Failed to fetch notifications:", res.status);
        return;
      }
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Add notification locally (from realtime)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
    notificationSound?.play();
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds,
          markAll: !notificationIds,
        }),
      });
      if (res.ok) {
        // Update local state
        if (notificationIds) {
          setNotifications((prev) =>
            prev.map((n) =>
              notificationIds.includes(n.id) ? { ...n, read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        } else {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadCount(0);
        }
      }
    } catch (e) {
      console.error("Error marking notifications as read:", e);
    }
  }, [session?.user?.id]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await markAsRead();
  }, [markAsRead]);

  // Delete notifications
  const deleteNotification = useCallback(async (notificationIds: string[]) => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !notificationIds.includes(n.id)));
        // Update unread count
        const deletedUnread = notifications.filter(
          (n) => notificationIds.includes(n.id) && !n.read
        ).length;
        setUnreadCount((prev) => Math.max(0, prev - deletedUnread));
      }
    } catch (e) {
      console.error("Error deleting notifications:", e);
    }
  }, [session?.user?.id, notifications]);

  // Listen for realtime notifications
  useEffect(() => {
    const handleNotification = (data: Notification) => {
      console.log("Notification received via Socket.IO:", data);
      addNotification(data);
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [addNotification]);

  // Register user with socket when session is available
  useEffect(() => {
    if (session?.user?.id && socket.connected) {
      socket.emit("register", session.user.id);
    }

    // Re-register and re-fetch on reconnect
    const handleReconnect = () => {
      if (session?.user?.id) {
        socket.emit("register", session.user.id);
        // Re-fetch notifications to recover any missed during disconnection
        refreshNotifications();
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [session?.user?.id, refreshNotifications]);

  // Initial fetch when session changes
  useEffect(() => {
    if (session?.user?.id) {
      refreshNotifications();
    }
  }, [session?.user?.id, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
