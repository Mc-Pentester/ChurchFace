"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";

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

export default function ChatPage() {
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const userName = session?.user?.name || "Anonyme";
  const userId = (session?.user as any)?.id || "";

  // Load initial messages
  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Optimistic update
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="h-[calc(100dvh-5rem)] lg:h-[100dvh] flex flex-col bg-gray-50">
      {/* HEADER */}
      <div className="p-4 bg-white shadow flex items-center justify-between">
        <h1 className="text-emerald-700 font-bold text-lg">💬 Chat en direct</h1>
        <span className="text-xs text-gray-500">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const isMine = m.userId === userId;
          return (
            <div
              key={m.id || i}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                  isMine
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                {!isMine && (
                  <div className="text-xs font-semibold mb-1 text-emerald-500">
                    {m.user}
                  </div>
                )}
                <div className="text-sm">{m.content}</div>
                <div
                  className={`text-[10px] mt-1 text-right ${
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
      <div className="p-4 bg-white flex gap-2 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écris un message..."
          className="flex-1 p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />

        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="bg-emerald-600 disabled:bg-gray-300 text-white px-5 py-2 rounded-xl font-medium hover:bg-emerald-700 transition"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}