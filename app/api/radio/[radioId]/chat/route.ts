import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSocketServer } from "@/lib/io";

export const runtime = "nodejs";


/**
 * GET /api/radio/:id/chat — Messages du chat
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const { radioId } = await params;

    const messages = await prisma.radioChatMessage.findMany({
      where: {
        radioId,
        isDeleted: false,
      },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        radio: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });


    return NextResponse.json({
      messages,
    });


  } catch (error) {

    console.error(
      "RADIO CHAT GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur chargement chat",
      },
      {
        status: 500,
      }
    );

  }
}



/**
 * POST /api/radio/:id/chat — Envoyer un message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {

  try {

    const session =
      await getServerSession(authOptions);


    const userId =
      (session?.user as any)?.id;


    const { radioId } =
      await params;


    const body =
      await req.json();


    const content =
      typeof body?.content === "string"
        ? body.content.trim()
        : "";



    if (!content) {

      return NextResponse.json(
        {
          error: "Contenu requis",
        },
        {
          status: 400,
        }
      );

    }



    const message =
      await prisma.radioChatMessage.create({

        data: {

          radioId,

          userId: userId || null,

          content,

        },


        include: {

          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },

        },

      });



    const io = getSocketServer();


    if (io) {

      io
        .to(`radio:${radioId}`)
        .emit(
          "radio:chat",
          message
        );


      io
        .to(`studio:${radioId}`)
        .emit(
          "radio:chat",
          message
        );

    }



    return NextResponse.json({
      message,
    });



  } catch (error) {

    console.error(
      "RADIO CHAT POST ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Erreur envoi message",
      },
      {
        status: 500,
      }
    );

  }
}