import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";


export async function GET() {

  const session =
    await getServerSession(authOptions);


  if (!session?.user) {

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );

  }


  if (session.user.role !== "ADMIN") {

    return NextResponse.json(
      { error: "Forbidden" },
      { status:403 }
    );

  }


  try {

    const reports =
      await prisma.report.findMany({

        where:{
          status:"PENDING",
        },


        include:{

          reporter:{
            select:{
              id:true,
              name:true,
              email:true,
              image:true,
            },
          },

        },


        orderBy:{
          createdAt:"desc",
        },

      });



    return NextResponse.json(reports);


  } catch(error){

    console.error(
      "Error fetching reports:",
      error
    );


    return NextResponse.json(
      {
        error:"Failed to fetch reports",
      },
      {
        status:500,
      }
    );

  }

}



export async function POST(req:Request){

  const session =
    await getServerSession(authOptions);



  if(!session?.user){

    return NextResponse.json(
      {
        error:"Unauthorized",
      },
      {
        status:401,
      }
    );

  }



  try {

    const userId =
      (session.user as {id:string}).id;



    const {
      targetId,
      targetType,
      reason,
      description,
    } = await req.json();



    if(
      !targetId ||
      !targetType ||
      !reason
    ){

      return NextResponse.json(
        {
          error:"Missing required fields",
        },
        {
          status:400,
        }
      );

    }



    const existingReport =
      await prisma.report.findFirst({

        where:{

          reporterId:userId,

          targetId,

          targetType,

        },

      });



    if(existingReport){

      return NextResponse.json(
        {
          error:"You have already reported this",
        },
        {
          status:400,
        }
      );

    }



    const report =
      await prisma.report.create({

        data:{

          reporterId:userId,

          targetId,

          targetType,

          reason,

          description:
            typeof description === "string"
              ? description.trim()
              : null,

        },


        include:{

          reporter:{
            select:{
              id:true,
              name:true,
              email:true,
              image:true,
            },
          },

        },

      });



    return NextResponse.json(
      report,
      {
        status:201,
      }
    );



  } catch(error){

    console.error(
      "Error creating report:",
      error
    );


    return NextResponse.json(
      {
        error:"Failed to create report",
      },
      {
        status:500,
      }
    );

  }

}