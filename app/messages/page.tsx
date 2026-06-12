import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: {
          userId: session?.user?.id,
        },
      },
    },
    include: {
      members: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">💬 Messages</h1>

      <div className="space-y-3">
        {chats.map((chat) => {
          const lastMessage = chat.messages?.[0];

          return (
            <Link
              key={chat.id}
              href={`/messages/${chat.id}`}
              className="block p-3 border rounded-lg hover:bg-gray-100"
            >
              <div className="font-semibold">
                {chat.isGroup ? chat.name || "Groupe" : "Conversation"}
              </div>

              <div className="text-sm text-gray-500 truncate">
                {lastMessage?.content || "Aucun message"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}