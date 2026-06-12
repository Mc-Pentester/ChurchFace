"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.emit("chat:join", chatId);

    socket.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message:new");
    };
  }, [chatId]);

  const sendMessage = () => {
    socket.emit("message:send", {
      chatId,
      content: input,
      senderId: session?.user?.id, // remplacer auth
    });

    setInput("");
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="p-2 bg-gray-100 rounded">
            {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2"
        />
        <button onClick={sendMessage} className="bg-emerald-600 text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
}