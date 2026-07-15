import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";


function generateSlug(title: string) {
  return `${title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()}`;
}



export async function GET(req: Request) {

  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(req.url);


  const categoryId = searchParams.get("categoryId");
  const seriesId = searchParams.get("seriesId");
  const authorId = searchParams.get("authorId");

  const period = searchParams.get("period") || "all";
  const sort = searchParams.get("sort") || "recent";
  const search = searchParams.get("search");


  const limit = Number(searchParams.get("limit") || 20);
  const page = Number(searchParams.get("page") || 1);



  try {

    const where: any = {
      isPublished: true,
    };


    if (categoryId) {
      where.categoryId = categoryId;
    }


    if (seriesId) {
      where.seriesId = seriesId;
    }


    if (authorId) {
      where.authorId = authorId;
    }



    if (search) {

      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];

    }



    if (period === "week") {

      where.publishedAt = {
        gte:
          new Date(
            Date.now() -
            7 * 24 * 60 * 60 * 1000
          ),
      };

    }


    if (period === "month") {

      where.publishedAt = {
        gte:
          new Date(
            Date.now() -
            30 * 24 * 60 * 60 * 1000
          ),
      };

    }



    let orderBy: any = {
      publishedAt: "desc",
    };


    if (sort === "views") {

      orderBy = {
        viewCount: "desc",
      };

    }


    if (sort === "rating") {

      orderBy = [
        {
          likeCount: "desc",
        },
        {
          bookmarkCount: "desc",
        },
      ];

    }



    const [preachings, total] =
      await Promise.all([


        prisma.preaching.findMany({

          where,

          orderBy,

          take: limit,

          skip:
            (page - 1) * limit,


          include: {

            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },


            category: true,


            series: {
              include: {
                category: true,
              },
            },


            verses: true,


            _count: {

              select: {

                preachingViews: true,
                likes: true,
                comments: true,
                bookmarks: true,

              },

            },

          },

        }),


        prisma.preaching.count({
          where,
        }),


      ]);





    if (session?.user?.id) {


      const ids =
        preachings.map(
          (item) => item.id
        );


      const [
        liked,
        bookmarked,
      ] = await Promise.all([


        prisma.preachingLike.findMany({

          where: {

            userId:
              session.user.id,

            preachingId: {
              in: ids,
            },

          },

          select: {
            preachingId: true,
          },

        }),


        prisma.preachingBookmark.findMany({

          where: {

            userId:
              session.user.id,

            preachingId: {
              in: ids,
            },

          },

          select: {
            preachingId: true,
          },

        }),


      ]);



      const likedSet =
        new Set(
          liked.map(
            (item) =>
              item.preachingId
          )
        );


      const bookmarkedSet =
        new Set(
          bookmarked.map(
            (item) =>
              item.preachingId
          )
        );



      preachings.forEach((item) => {

        (item as any).isLiked =
          likedSet.has(item.id);


        (item as any).isBookmarked =
          bookmarkedSet.has(item.id);

      });


    }



    return NextResponse.json({

      preachings,

      pagination: {

        total,

        pages:
          Math.ceil(
            total / limit
          ),

        page,

        limit,

      },

    });



  } catch (error) {


    console.error(
      "Error fetching preachings:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed to fetch preachings",
      },
      {
        status: 500,
      }
    );


  }

}






export async function POST(req: Request) {


  const session =
    await getServerSession(authOptions);



  if (!session?.user?.id) {

    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );

  }



  try {


    const body =
      await req.json();


    const {
      title,
      description,
      thumbnail,
      videoUrl,
      audioUrl,
      duration,
      categoryId,
      seriesId,
      verses,
    } = body;



    if (
      !title ||
      !description ||
      !videoUrl
    ) {

      return NextResponse.json(
        {
          error:
            "Missing required fields",
        },
        {
          status: 400,
        }
      );

    }



     const preaching = await prisma.preaching.create({
      data: {
        title,
        slug: generateSlug(title),
        description,
        thumbnail,
        videoUrl,
        audioUrl,
        duration,
        categoryId,
        authorId: session.user.id,
        seriesId,

        verses: verses
          ? {
              create: verses.map((verse: any) => ({
                book: verse.book,
                chapter: verse.chapter,
                verse: verse.verse,
                text: verse.text,
              })),
            }
          : undefined,
      },

      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },

        category: true,

        series: true,

        verses: true,
      },
    });


    return NextResponse.json(
      preaching,
      { status: 201 }
    );


  } catch (error) {

    console.error(
      "Error creating preaching:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed to create preaching",
      },
      {
        status: 500,
      }
    );

  }
}