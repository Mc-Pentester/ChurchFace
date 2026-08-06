/**
 * Studio Permission Service
 *
 * Centralise toutes les règles d'accès au Studio ChurchFace.
 *
 * Règles :
 * - ADMIN global : accès complet
 * - ChurchAdmin OWNER : accès Studio de son église
 * - ChurchAdmin ADMIN : accès Studio de son église
 * - USER : accès uniquement à ses propres broadcasts
 */

import { prisma } from "@/lib/prisma";
import { normalizeChurchRole } from "@/lib/church-role";


export interface StudioAccessParams {
  userId: string;
  userRole?: string;
  churchSlug?: string;
  broadcastId?: string;
}


export interface StudioAccessResult {
  authorized: boolean;
  reason?: string;
  churchId?: string;
  churchRole?: string;
}



export class StudioPermissionService {


  static async canAccessStudio(
    params: StudioAccessParams
  ): Promise<StudioAccessResult> {


    const {
      userId,
      userRole,
      churchSlug,
      broadcastId,
    } = params;



    /**
     * 1 - Administrateur global ChurchFace
     */
    if (
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN"
    ) {

      return {
        authorized: true,
        reason: "Global administrator",
      };
    }



    /**
     * 2 - Contexte église
     */
    if (churchSlug) {


      const church =
        await prisma.church.findUnique({
          where:{
            slug: churchSlug,
          },
        });



      if (!church) {

        return {
          authorized:false,
          reason:"Church not found",
        };

      }



      const churchAdmin =
        await prisma.churchAdmin.findUnique({
          where:{
            churchId_userId:{
              churchId:church.id,
              userId,
            },
          },
        });



      if (churchAdmin) {


        const churchRole =
          normalizeChurchRole(
            churchAdmin.role
          );



        if (
          churchRole === "CHURCH_OWNER" ||
          churchRole === "CHURCH_ADMIN"
        ) {


          return {

            authorized:true,

            reason:
              `Church ${churchRole}`,

            churchId:
              church.id,

            churchRole,

          };

        }

      }



      return {
        authorized:false,
        reason:"Not a church administrator",
      };

    }




    /**
     * 3 - Contexte broadcast
     */
    if (broadcastId) {


      const broadcast =
        await prisma.liveBroadcast.findUnique({
          where:{
            id:broadcastId,
          },
        });



      if (!broadcast) {

        return {
          authorized:false,
          reason:"Broadcast not found",
        };

      }



      /**
       * Broadcast personnel utilisateur
       */
      if (
        broadcast.ownerType === "USER" &&
        broadcast.authorId === userId
      ) {


        return {

          authorized:true,

          reason:"Broadcast owner",

        };

      }




      /**
       * Broadcast appartenant à une église
       */
      if (
        broadcast.ownerType === "CHURCH" &&
        broadcast.ownerId
      ) {


        const churchAdmin =
          await prisma.churchAdmin.findUnique({
            where:{
              churchId_userId:{
                churchId:broadcast.ownerId,
                userId,
              },
            },
          });



        if (churchAdmin) {


          const churchRole =
            normalizeChurchRole(
              churchAdmin.role
            );


          if (
            churchRole === "CHURCH_OWNER" ||
            churchRole === "CHURCH_ADMIN"
          ) {


            return {

              authorized:true,

              reason:
                `Church ${churchRole}`,

              churchId:
                broadcast.ownerId,

              churchRole,

            };

          }

        }

      }



      return {

        authorized:false,

        reason:"Not authorized for this broadcast",

      };

    }




    /**
     * Aucun contexte
     */
    return {

      authorized:false,

      reason:"No context provided",

    };

  }





  /**
   * Retourne le contexte Studio complet
   */
  static async getStudioContext(
    params: StudioAccessParams
  ) {


    const access =
      await this.canAccessStudio(params);



    if (!access.authorized) {

      throw new Error(
        access.reason || "Access denied"
      );

    }




    if (
      params.churchSlug &&
      access.churchId
    ) {


      const church =
        await prisma.church.findUnique({
          where:{
            id:access.churchId,
          },
        });



      return {

        authorized:true,

        churchId:
          access.churchId,

        churchRole:
          access.churchRole,

        churchName:
          church?.name,

        churchSlug:
          church?.slug,

      };

    }




    if (params.broadcastId) {


      const broadcast =
        await prisma.liveBroadcast.findUnique({

          where:{
            id:params.broadcastId,
          },

          include:{
            author:true,
          },

        });



      return {

        authorized:true,

        broadcastId:
          broadcast?.id,

        broadcastName:
          broadcast?.title,

        ownerType:
          broadcast?.ownerType,

        ownerId:
          broadcast?.ownerId,

        authorId:
          broadcast?.authorId,

      };

    }



    return access;

  }

}