import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET - Récupérer les playlists d'une église
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const church = await prisma.church.findUnique({
      where: { slug },
      include: {
        admins: true,
      },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const isAdmin = church.admins.some(
      (admin) => admin.userId === session.user.id
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }


    // Récupérer toutes les playlists créées pour cette église
    const playlists = await prisma.churchPlaylist.findMany({
      where: {
        churchId: church.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });


    return NextResponse.json({ playlists });

  } catch (error) {

    console.error(
      "Error fetching church playlists:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}


/**
 * POST - Créer une playlist pour une église
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {

  const { slug } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }


  try {

    const body = await req.json();


    const church = await prisma.church.findUnique({
      where: { slug },
      include:{
        admins:true
      }
    });


    if (!church) {
      return NextResponse.json(
        { error:"Church not found" },
        {status:404}
      );
    }


    const isAdmin = church.admins.some(
      admin => admin.userId === session.user.id
    );


    if(!isAdmin){
      return NextResponse.json(
        {error:"Forbidden"},
        {status:403}
      );
    }



    const playlist = await prisma.churchPlaylist.create({
      data: {
        title: body.title || "Nouvelle playlist",
        description: body.description || "",
        category: body.category || "GENERAL",
        churchId: church.id,
      },


      include:{
        items:{
          orderBy:{
            order:"asc"
          }
        }
      }

    });



    return NextResponse.json({
      playlist
    });



  } catch(error){

    console.error(
      "CREATE CHURCH PLAYLIST ERROR:",
      error
    );


    return NextResponse.json(
      {error:"Failed creating playlist"},
      {status:500}
    );
  }
}




/**
 * PATCH - Modifier une playlist
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
){

  const {slug}=await params;


  const session =
    await getServerSession(authOptions);


  if(!session?.user){

    return NextResponse.json(
      {error:"Unauthorized"},
      {status:401}
    );

  }



  try{


    const body =
      await req.json();



    const church =
      await prisma.church.findUnique({

        where:{
          slug
        },

        include:{
          admins:true
        }

      });



    if(!church){

      return NextResponse.json(
        {error:"Church not found"},
        {status:404}
      );

    }




    const isAdmin = church.admins.some(admin => admin.userId === session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingPlaylist = await prisma.churchPlaylist.findFirst({
  where: {
    id: body.id,
    churchId: church.id,
  },
});

if (!existingPlaylist) {
  return NextResponse.json(
    { error: "Playlist not found" },
    { status: 404 }
  );
}

    const playlist = await prisma.churchPlaylist.update({
      where: { id: body.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
      },
      include: {
        items: {
          orderBy: { order: "asc" as const },
        },
      },
    });

    return NextResponse.json({
      playlist
    });



  }catch(error){

    console.error(
      "UPDATE CHURCH PLAYLIST ERROR:",
      error
    );


    return NextResponse.json(
      {error:"Failed updating playlist"},
      {status:500}
    );

  }

}