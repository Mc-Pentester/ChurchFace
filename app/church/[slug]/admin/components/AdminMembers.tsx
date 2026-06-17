import { prisma } from "@/lib/prisma";

interface AdminMembersProps {
  churchId: string;
}

export default async function AdminMembers({ churchId }: AdminMembersProps) {
  const members = await prisma.churchMember.findMany({
    where: { churchId },
    take: 10,
    orderBy: { joinedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Membres</h2>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
          Ajouter un membre
        </button>
      </div>

      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun membre pour le moment</p>
        ) : (
          members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                  {member.user.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.user.name}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  {member.role}
                </span>
                {member.isActive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Actif
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Inactif
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
