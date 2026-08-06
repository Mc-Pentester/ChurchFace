import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {
  getServerSession,
} from "next-auth";

import type {
  NextAuthOptions,
} from "next-auth";



const STUDIO_ROLES = [

  "ADMIN",

  "SUPER_ADMIN",

  "RADIO_HOST",

  "CHURCH_ADMIN",

  "CHURCH_OWNER",

];





export const authOptions: NextAuthOptions = {


  adapter:
    PrismaAdapter(prisma),



  session: {

    strategy:"jwt",

  },



  providers:[


    CredentialsProvider({

      name:"credentials",


      credentials:{


        email:{
          label:"Email",
          type:"text",
        },


        password:{
          label:"Password",
          type:"password",
        },

      },



      async authorize(credentials){



        if(
          !credentials?.email ||
          !credentials.password
        ){

          return null;

        }



        const user =
          await prisma.user.findUnique({

            where:{
              email:
                credentials.email,
            },

          });



        if(!user){

          return null;

        }



        const validPassword =
          await bcrypt.compare(

            credentials.password,

            user.password

          );



        if(!validPassword){

          return null;

        }




        return {

          id:user.id,

          email:user.email,

          name:user.name,

          image:user.image,

          role:user.role,

          churchId:user.churchId,

        };

      },


    }),


  ],





  callbacks:{



    async jwt({

      token,

      user,

    }){



      /**
       * Première connexion
       */
      if(user){


        token.id =
          user.id;



        token.role =
          user.role ?? "USER";



        token.churchId =
          (user as any).churchId ?? null;



        token.roleCheckedAt =
          Date.now();



        return token;

      }






      /**
       * Synchronisation rôle Prisma
       * toutes les 5 minutes
       */
      const lastCheck =
        Number(
          token.roleCheckedAt ?? 0
        );



      const REFRESH =
        5 * 60 * 1000;




      if(
        token.id &&
        Date.now() - lastCheck > REFRESH
      ){



        const dbUser =
          await prisma.user.findUnique({

            where:{
              id:
                token.id as string,
            },


            select:{

              role:true,

              churchId:true,

            },

          });




        if(dbUser){


          token.role =
            dbUser.role;



          token.churchId =
            dbUser.churchId ?? null;


        }



        token.roleCheckedAt =
          Date.now();


      }





      return token;


    },








    async session({

      session,

      token,

    }){



      if(session.user){



        session.user.id =
          token.id as string;



        session.user.role =
          (token.role as string)
          ?? "USER";



        (
          session.user as typeof session.user &
          {
            churchId?:string|null;
          }

        ).churchId =
          token.churchId as
          string|null;



      }




      return session;


    },



  },




  pages:{


    signIn:"/login",


  },



  secret:
    process.env.NEXTAUTH_SECRET,


};







/**
 * Helper NextAuth centralisé
 *
 * Utilisé dans les API routes :
 *
 * const session = await auth()
 */
export async function auth(){

  return await getServerSession(
    authOptions
  );

}









/**
 * Accès Studio global
 *
 * Compatible StudioPermissionService
 */
export async function requireStudioAccess(){



  const session =
    await auth();




  const userId =
    session?.user?.id;




  if(!userId){

    return null;

  }






  const user =
    await prisma.user.findUnique({

      where:{
        id:userId,
      },


      select:{


        id:true,


        email:true,


        name:true,


        image:true,


        role:true,


        churchId:true,


        churchAdmins:{

          select:{

            churchId:true,

            role:true,

          },

        },


      },


    });






  if(!user){

    return null;

  }






  const hasStudioRole =
    STUDIO_ROLES.includes(
      user.role
    );





  if(!hasStudioRole){


    return null;


  }





  const churchAdmin =
    user.churchAdmins[0];





  return {


    id:user.id,


    email:user.email,


    name:user.name,


    image:user.image,


    role:user.role,


    churchId:

      user.churchId ??

      churchAdmin?.churchId ??

      null,



  };


}









/**
 * Gestion Radio
 */
export async function canManageRadio(

  radioId:string,

  userId:string

){



  const radio =
    await prisma.radio.findUnique({

      where:{
        id:radioId,
      },


      select:{
        userId:true,
      },

    });





  if(!radio){

    return false;

  }





  if(
    radio.userId === userId
  ){

    return true;

  }





  const user =
    await prisma.user.findUnique({

      where:{
        id:userId,
      },


      select:{
        role:true,
      },


    });





  return (

    user?.role === "ADMIN"

    ||

    user?.role === "SUPER_ADMIN"

  );


}









/**
 * Vérification administrateur
 */
export async function requireAdmin(){



  const session =
    await auth();




  const userId =
    session?.user?.id;




  if(!userId){

    return null;

  }






  const user =
    await prisma.user.findUnique({

      where:{
        id:userId,
      },


      select:{


        id:true,


        email:true,


        name:true,


        image:true,


        role:true,


      },


    });






  if(

    !user

    ||

    ![

      "ADMIN",

      "SUPER_ADMIN",

    ].includes(user.role)

  ){

    return null;

  }






  return user;


}