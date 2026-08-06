import { prisma } from "@/lib/prisma";

function normalizeChurchRole(role?: string | null) {
  if (!role) return null;

  switch (role) {
    case "OWNER":
      return "CHURCH_OWNER";

    case "ADMIN":
      return "CHURCH_ADMIN";

    default:
      return role;
  }
}


export async function getChurchAdminRole(
  churchId: string,
  userId: string
) {
  const admin = await prisma.churchAdmin.findUnique({
    where: {
      churchId_userId: {
        churchId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  return normalizeChurchRole(admin?.role);
}


export async function userHasChurchRole(
  churchId: string,
  userId: string,
  allowedRoles: string[]
) {

  const role = await getChurchAdminRole(
    churchId,
    userId
  );


  if (role && allowedRoles.includes(role)) {
    return true;
  }


  // OWNER = accès complet administration église
  if (
    role === "CHURCH_OWNER" &&
    (
      allowedRoles.includes("CHURCH_ADMIN") ||
      allowedRoles.includes("ADMIN")
    )
  ) {
    return true;
  }


  // ADMIN membre église
  if (allowedRoles.includes("ADMIN")) {

    const member =
      await prisma.churchMember.findFirst({
        where:{
          churchId,
          userId,
          role:"ADMIN",
        },
      });

    if(member) {
      return true;
    }
  }


  // rôle global utilisateur
  const user =
    await prisma.user.findUnique({
      where:{
        id:userId,
      },
      select:{
        role:true,
      },
    });


  if (
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN"
  ) {
    return true;
  }


  return false;
}



export async function requireChurchRoleOrThrow(
  churchId:string,
  userId:string,
  allowedRoles:string[]
){

  const ok =
    await userHasChurchRole(
      churchId,
      userId,
      allowedRoles
    );


  if(!ok){

    const e:any =
      new Error("Forbidden");

    e.status = 403;

    throw e;
  }
}