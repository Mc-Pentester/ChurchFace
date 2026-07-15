import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      Number(searchParams.get("limit") || 10),
      50
    );


    ////////////////////////////////////////////////////////////
    // USER HISTORY
    ////////////////////////////////////////////////////////////

    const viewedPreachings =
      await prisma.preachingView.findMany({
        where: {
          userId,
        },
        select: {
          preachingId: true,
        },
        orderBy: {
          watchedAt: "desc",
        },
        take: 50,
      });


    const viewedIds = viewedPreachings.map(
      (item) => item.preachingId
    );


    const likedPreachings =
      await prisma.preachingLike.findMany({
        where: {
          userId,
        },
        select: {
          preachingId: true,
        },
        take: 50,
      });


    const likedIds = likedPreachings.map(
      (item) => item.preachingId
    );


    const bookmarkedPreachings =
      await prisma.preachingBookmark.findMany({
        where: {
          userId,
        },
        select: {
          preachingId: true,
        },
        take: 50,
      });


    const bookmarkedIds =
      bookmarkedPreachings.map(
        (item) => item.preachingId
      );


    const historyIds = [
      ...viewedIds,
      ...likedIds,
      ...bookmarkedIds,
    ];


    ////////////////////////////////////////////////////////////
    // USER PREFERENCES
    ////////////////////////////////////////////////////////////

    const historyPreachings =
      await prisma.preaching.findMany({
        where: {
          id: {
            in: historyIds,
          },
        },
        select: {
          categoryId: true,
          authorId: true,
        },
      });


    const categoryIds = [
      ...new Set(
        historyPreachings
          .map((item) => item.categoryId)
          .filter(
            (id): id is string =>
              id !== null
          )
      ),
    ];


    const authorIds = [
      ...new Set(
        historyPreachings.map(
          (item) => item.authorId
        )
      ),
    ];


    ////////////////////////////////////////////////////////////
    // RECOMMENDATIONS
    ////////////////////////////////////////////////////////////

    const recommendations =
      await prisma.preaching.findMany({
        where: {
          AND: [

            {
              id: {
                notIn: historyIds,
              },
            },


            ...(categoryIds.length ||
            authorIds.length
              ? [
                  {
                    OR: [

                      ...(categoryIds.length
                        ? [
                            {
                              categoryId: {
                                in: categoryIds,
                              },
                            },
                          ]
                        : []),


                      ...(authorIds.length
                        ? [
                            {
                              authorId: {
                                in: authorIds,
                              },
                            },
                          ]
                        : []),

                    ],
                  },
                ]
              : []),

          ],
        },


        orderBy: [

          {
            likeCount: "desc",
          },

          {
            viewCount: "desc",
          },

          {
            bookmarkCount: "desc",
          },

          {
            publishedAt: "desc",
          },

        ],


        take: limit,


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


          _count: {
            select: {
              preachingViews: true,
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },

        },

      });



    ////////////////////////////////////////////////////////////
    // USER FLAGS
    ////////////////////////////////////////////////////////////

    const recommendationIds =
      recommendations.map(
        (item) => item.id
      );


    const [
      userLikes,
      userBookmarks,
    ] = await Promise.all([


      prisma.preachingLike.findMany({
        where: {
          userId,

          preachingId: {
            in: recommendationIds,
          },
        },

        select: {
          preachingId: true,
        },
      }),


      prisma.preachingBookmark.findMany({
        where: {
          userId,

          preachingId: {
            in: recommendationIds,
          },
        },

        select: {
          preachingId: true,
        },
      }),


    ]);



    const likedSet = new Set(
      userLikes.map(
        (item) => item.preachingId
      )
    );


    const bookmarkedSet = new Set(
      userBookmarks.map(
        (item) => item.preachingId
      )
    );



    ////////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////////

    const result =
      recommendations.map(
        (preaching) => ({
          ...preaching,

          isLiked:
            likedSet.has(preaching.id),

          isBookmarked:
            bookmarkedSet.has(preaching.id),
        })
      );



    return NextResponse.json({
      preachings: result,
    });



  } catch (error) {

    console.error(
      "Error fetching recommendations:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Failed to fetch recommendations",
      },
      {
        status: 500,
      }
    );

  }
}