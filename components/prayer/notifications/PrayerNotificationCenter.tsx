"use client";

import { useState } from "react";
import { Bell, X, Check, CheckCheck, Heart, Users, Calendar, Flame, MessageCircle } from "lucide-react";

interface PrayerNotification {
  id: string;
  type: "NEW_PRAYER" | "PRAYER_ANSWERED" | "CHAIN_INVITE" | "CAMPAIGN_START" | "ROOM_STARTED" | "ENGAGEMENT";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface PrayerNotificationCenterProps {
  notifications: PrayerNotification[];
  unreadCount: number;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notificationId: string) => void;
}

const NOTIFICATION_ICONS = {
  NEW_PRAYER: Heart,
  PRAYER_ANSWERED: Check,
  CHAIN_INVITE: Users,
  CAMPAIGN_START: Flame,
  ROOM_STARTED: Calendar,
  ENGAGEMENT: MessageCircle,
};

const NOTIFICATION_COLORS = {
  NEW_PRAYER: "text-red-500 bg-red-50",
  PRAYER_ANSWERED: "text-green-500 bg-green-50",
  CHAIN_INVITE: "text-blue-500 bg-blue-50",
  CAMPAIGN_START: "text-orange-500 bg-orange-50",
  ROOM_STARTED: "text-purple-500 bg-purple-50",
  ENGAGEMENT: "text-pink-500 bg-pink-50",
};

export function PrayerNotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: PrayerNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (notificationId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleDelete = (notificationId: string) => {
    if (onDelete) {
      onDelete(notificationId);
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && onMarkAllAsRead && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Tout lire
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {sortedNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sortedNotifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type];
                    const colorClass = NOTIFICATION_COLORS[notification.type];

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && onMarkAsRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-4 h-4 text-gray-600" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                title="Supprimer"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {sortedNotifications.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
