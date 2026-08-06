import { prisma } from "@/lib/prisma";
import { normalizeChurchRole } from "@/lib/church-role";


/**
 * Récupère le rôle administrateur d'un utilisateur
 * dans une église donnée.
 */
export async function getChurchAdminRole(
  churchId: string,
  userId: string
): Promise<string | null> {

  const admin =
    await prisma.churchAdmin.findUnique({
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



/**
 * Vérifie si un utilisateur possède
 * un rôle autorisé dans une église.
 */
export async function userHasChurchRole(
  churchId: string,
  userId: string,
  allowedRoles: string[]
): Promise<boolean> {


  /**
   * 1. Vérification ChurchAdmin
   */
  const churchRole =
    await getChurchAdminRole(
      churchId,
      userId
    );


  if (
    churchRole &&
    allowedRoles.includes(churchRole)
  ) {
    return true;
  }



  /**
   * OWNER possède tous les droits administrateur église
   */
  if (
    churchRole === "CHURCH_OWNER" &&
    (
      allowedRoles.includes("CHURCH_ADMIN") ||
      allowedRoles.includes("ADMIN")
    )
  ) {
    return true;
  }



  /**
   * 2. Vérification ChurchMember ADMIN
   */
  if (
    allowedRoles.includes("ADMIN")
  ) {

    const member =
      await prisma.churchMember.findFirst({
        where: {
          churchId,
          userId,
          role: "ADMIN",
        },
      });


    if (member) {
      return true;
    }
  }



  /**
   * 3. Vérification rôle global utilisateur
   */
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
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



/**
 * Middleware permission église.
 * Lance une erreur 403 si accès refusé.
 */
export async function requireChurchRoleOrThrow(
  churchId: string,
  userId: string,
  allowedRoles: string[]
): Promise<void> {


  const authorized =
    await userHasChurchRole(
      churchId,
      userId,
      allowedRoles
    );


  if (!authorized) {

    const error =
      new Error(
        "Forbidden"
      ) as Error & {
        status?: number;
      };


    error.status = 403;


    throw error;
  }
}