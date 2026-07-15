import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";


/**
 * Rôles autorisés pour Radio Studio
 */
const STUDIO_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "RADIO_HOST",
  "CHURCH_ADMIN",
];



export const authOptions: NextAuthOptions = {

  adapter: PrismaAdapter(prisma),


  session: {
    strategy: "jwt",
  },


  providers: [

    CredentialsProvider({

      name: "credentials",


      credentials: {

        email: {
          label: "Email",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },

      },



      async authorize(credentials) {


        if(
          !credentials?.email ||
          !credentials.password
        ){
          return null;
        }



        const user =
          await prisma.user.findUnique({

            where:{
              email: credentials.email,
            },

          });



        if(!user){
          return null;
        }



        const passwordValid =
          await bcrypt.compare(
            credentials.password,
            user.password
          );



        if(!passwordValid){
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



    /**
     * JWT
     */
    async jwt({
      token,
      user,
    }) {


      /**
       * Première connexion
       */
      if(user){

        token.id = user.id;

        token.role =
          user.role;

        token.churchId =
          user.churchId ?? null;


        token.roleCheckedAt =
          Date.now();


        return token;

      }



      /**
       * Synchronisation périodique
       */
      const lastCheck =
        token.roleCheckedAt ?? 0;



      const REFRESH_INTERVAL =
        5 * 60 * 1000;



      if(
        token.id &&
        Date.now() - lastCheck > REFRESH_INTERVAL
      ){


        const dbUser =
          await prisma.user.findUnique({

            where:{
              id:token.id,
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
            dbUser.churchId;

        }



        token.roleCheckedAt =
          Date.now();

      }



      return token;

    },




    /**
     * Session frontend
     */
    async session({
      session,
      token,
    }) {


      if(session.user){


        session.user.id =
          token.id as string;


        session.user.role =
          token.role ?? "USER";


        session.user.churchId =
          token.churchId ?? null;

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
 * Vérifie accès Radio Studio
 */
export async function requireStudioAccess(){

  const session =
    await getServerSession(authOptions);

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
          },
        },

      },

    });

  if(!user){
    return null;
  }

  if(
    !STUDIO_ROLES.includes(user.role)
  ){

    return null;

  }

  const churchId =
    user.churchId ??
    user.churchAdmins[0]?.churchId ??
    null;

  return {

    id:user.id,
    email:user.email,
    name:user.name,
    image:user.image,
    role:user.role,
    churchId,

  };

}

/**
 * Vérifie gestion radio
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
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN"
  );

}





/**
 * Vérification admin globale
 */
export async function requireAdmin(){

  const session =
    await getServerSession(authOptions);

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
    !user ||
    ![
      "ADMIN",
      "SUPER_ADMIN",
    ].includes(user.role)
  ){

    return null;

  }

  return user;

}