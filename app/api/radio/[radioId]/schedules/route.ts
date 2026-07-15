import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";


/**
 * GET /api/radio/:radioId/schedules
 * Liste les programmes d'une radio
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const { radioId } = await params;


    const schedules = await prisma.radioSchedule.findMany({
      where: {
        radioId,
      },

      orderBy: {
        startTime: "asc",
      },

      include: {
        playlist: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });


    return NextResponse.json({
      schedules,
    });


  } catch (error) {

    console.error(
      "RADIO SCHEDULES GET ERROR:",
      error
    );


    return NextResponse.json(
      {
        error: "Erreur chargement plannings",
      },
      {
        status: 500,
      }
    );

  }
}



/**
 * POST /api/radio/:radioId/schedules
 * Créer un programme radio
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {

  try {

    const session =
      await getServerSession(authOptions);


    const userId =
      (session?.user as { id?: string })?.id;


    if (!userId) {

      return NextResponse.json(
        {
          error: "Non autorisé",
        },
        {
          status: 401,
        }
      );

    }



    const { radioId } =
      await params;


    const body =
      await req.json();



    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";



    const startTime =
      body?.startTime
        ? new Date(body.startTime)
        : null;



    const duration =
      typeof body?.duration === "number"
        ? body.duration
        : 60;



    const isRecurring =
      Boolean(body?.isRecurring);



    const recurrence =
      typeof body?.recurrence === "string"
        ? body.recurrence
        : null;



    if (!title || !startTime || isNaN(startTime.getTime())) {

      return NextResponse.json(
        {
          error:
            "Titre et date valides requis",
        },
        {
          status: 400,
        }
      );

    }



    /**
     * Calcul automatique de la fin
     */
    const endTime =
      new Date(
        startTime.getTime()
        +
        duration * 60 * 1000
      );



    const schedule =
      await prisma.radioSchedule.create({

        data: {

          radioId,


          title,


          description:
            typeof body?.description === "string"
              ? body.description.trim()
              : null,


          hostName:
            typeof body?.hostName === "string"
              ? body.hostName.trim()
              : null,


          startTime,


          duration,


          endTime,


          isRecurring,


          recurrence,


          playlistId:
            body?.playlistId || null,

        },


        include: {

          playlist: {
            select: {
              id: true,
              title: true,
            },
          },

        },

      });



    return NextResponse.json(
      {
        schedule,
      },
      {
        status: 201,
      }
    );



  } catch (error) {

    console.error(
      "RADIO SCHEDULES POST ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Erreur création planning",
      },
      {
        status: 500,
      }
    );

  }
}