"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Toast = {
  id: string;
  message: string;
  visible: boolean;
};

export default function NotificationToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;

    fetch("/api/socket")
      .then(() => {
        socket = io();

        socket.on("notification", (data: { message: string }) => {
          setToast({
            id: Date.now().toString(),
            message: data.message,
            visible: true,
          });

          setTimeout(() => {
            setToast(null);
          }, 4000);
        });
      })
      .catch(console.error);

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slide-in">
      <div className="bg-white shadow-lg border-l-4 border-emerald-500 rounded-xl px-4 py-3 w-80 max-w-[calc(100vw-2.5rem)]">
        
        <p className="text-gray-800 font-medium">
          {toast.message}
        </p>

        <span className="text-xs text-gray-400">
          Maintenant
        </span>

      </div>
    </div>
  );
}