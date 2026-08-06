import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { BroadcastContextService } from "@/lib/broadcast/BroadcastContextService";
import { StudioPermissionService } from "@/lib/studio/StudioPermissionService";
import { ResolveContextParams } from "@/types/broadcast";


export const runtime = "nodejs";


/**
 * POST - Résoudre le contexte Studio avec permissions
 */
export async function POST(req: NextRequest) {

  try {

    const session =
      await getServerSession(authOptions);



    if (!session?.user?.id) {

      return NextResponse.json(
        {
          error:"Unauthorized",
          reason:"No session"
        },
        {
          status:401
        }
      );

    }



    const body =
      await req.json();



    const userId =
      session.user.id;



    const userRole =
      session.user.role ?? "USER";



    console.log(
      "STUDIO CONTEXT USER:",
      {
        id:userId,
        role:userRole,
        church:body.churchSlug
      }
    );

    console.log("========== STUDIO CONTEXT DEBUG ==========");

    console.log("SESSION USER ID:", session?.user?.id);

    console.log("SESSION ROLE:", session?.user?.role);

    console.log("BODY:", body);

    console.log("CHURCH SLUG:", body.churchSlug);

    console.log("BROADCAST ID:", body.broadcastId);

    console.log("==========================================");

    const accessCheck =
      await StudioPermissionService.canAccessStudio({

        userId,

        userRole,

        churchSlug:
          body.churchSlug,

        broadcastId:
          body.broadcastId,

      });



    if(!accessCheck.authorized){

      return NextResponse.json(
        {
          error:"Access denied",
          reason:accessCheck.reason
        },
        {
          status:403
        }
      );

    }



    const params: ResolveContextParams = {

      broadcastId:
        body.broadcastId,

      churchSlug:
        body.churchSlug,

      userId,

      userRole,

      userName:
        session.user.name ?? "",

    };

    console.log(
      "CREATING STUDIO CONTEXT WITH USER:",
      {
        userId: params.userId,
        userRole: params.userRole,
        userName: params.userName
      }
    );

    const context =
      await BroadcastContextService.resolveContext(
        params
      );



    return NextResponse.json(context);



  } catch(error){


    console.error(
      "Error resolving studio context:",
      error
    );


    return NextResponse.json(
      {
        error:"Failed to resolve broadcast context"
      },
      {
        status:500
      }
    );

  }

}