"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { messageSound } from "@/lib/sounds";

export default function ChatBox({ chatId, userId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const typingTimeout = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("ChatBox useEffect running, chatId:", chatId, "userId:", userId);
    if (!chatId) return;

    socket.emit("chat:join", chatId);
    console.log("Joined chat room:", chatId);

    const handleNewMessage = (msg: any) => {
      console.log("New message received via socket in ChatBox:", msg);
      setMessages((prev) => [...prev, msg]);
      messageSound?.play();
    };

    const handleTyping = ({ userId: typingUser, isTyping }: any) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(typingUser)) return [...prev, typingUser];
          return prev;
        } else {
          return prev.filter((u) => u !== typingUser);
        }
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTyping);

    socket.emit("message:seen", { chatId, userId });

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:update", handleTyping);
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      chatId,
      senderId: userId,
      content: text,
    };

    socket.emit("message:send", msg);

    setMessages((prev) => [...prev, msg]);
    setText("");

    socket.emit("typing", { chatId, userId, isTyping: false });
  };

  const handleTypingInput = (value: string) => {
    setText(value);

    socket.emit("typing", { chatId, userId, isTyping: true });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { chatId, userId, isTyping: false });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl">
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m: any, i: number) => {
          const isMe = m.senderId === userId;
          return (
            <div key={m.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-2xl max-w-xs text-sm ${isMe ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                {!isMe && m.senderName && (
                  <div className="text-[10px] text-emerald-500 font-semibold mb-0.5">{m.senderName}</div>
                )}
                {m.content}
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <p className="text-xs text-gray-500 px-2">✍️ quelqu’un écrit...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => handleTypingInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded-full px-4 py-2 outline-none"
          placeholder="Écrire un message..."
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="bg-emerald-600 disabled:bg-gray-300 text-white px-4 rounded-full hover:bg-emerald-700 transition"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}