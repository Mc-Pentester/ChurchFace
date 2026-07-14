"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { X, Minus, MessageCircle } from "lucide-react";

type Message = {
  id?: string;
  user: string;
  userId?: string;
  content: string;
  createdAt?: string;
};

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPopup() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Anonyme";
  const userId = (session?.user as any)?.id || "";

  // Load initial messages
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for sidebar toggle event
  useEffect(() => {
    const onToggle = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("toggle-chat-popup", onToggle);
    return () => window.removeEventListener("toggle-chat-popup", onToggle);
  }, []);

  // Socket receive
  useEffect(() => {
    const handler = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id && m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("chat:new", handler);
    return () => {
      socket.off("chat:new", handler);
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    const msg: Message = {
      user: userName,
      userId,
      content: text,
      createdAt: new Date().toISOString(),
    };

    socket.emit("chat:new", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition hover:scale-105"
        title="Ouvrir le chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
        isMinimized ? "h-14" : "h-[500px]"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-600 text-white rounded-t-2xl shrink-0">
        <span className="font-semibold text-sm">💬 Chat en direct</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized((m) => !m)}
            className="hover:bg-emerald-700 p-1 rounded transition"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-emerald-700 p-1 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => {
              const isMine = m.userId === userId;
              return (
                <div
                  key={m.id || i}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      isMine
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {!isMine && (
                      <div className="text-[10px] font-semibold mb-0.5 text-emerald-500">
                        {m.user}
                      </div>
                    )}
                    <div>{m.content}</div>
                    <div
                      className={`text-[10px] mt-0.5 text-right ${
                        isMine ? "text-emerald-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 flex gap-2 shrink-0">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écris un message..."
              className="flex-1 p-2 bg-gray-100 rounded-xl outline-none text-base focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="bg-emerald-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
            >
              Envoyer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
