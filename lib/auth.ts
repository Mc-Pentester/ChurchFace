import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";

/**
 * 🔐 Rôles autorisés pour le studio
 */
const STUDIO_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "RADIO_HOST",
  "CHURCH_ADMIN",
];

/**
 * 🔐 Configuration NextAuth
 */
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
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          churchId: user.churchId,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT STORAGE
     */
    async jwt({ token, user }) {

      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.churchId = (user as any).churchId ?? null;
        token.roleCheckedAt = Date.now();

        return token;
      }


      /**
       * Refresh rôle depuis Prisma
       */
      const lastCheck =
        (token.roleCheckedAt as number) || 0;

      const REFRESH_TIME =
        5 * 60 * 1000;


      if (
        token.id &&
        Date.now() - lastCheck > REFRESH_TIME
      ) {

        const dbUser =
          await prisma.user.findUnique({
            where:{
              id: token.id as string,
            },
            select:{
              role:true,
              churchId:true,
            },
          });


        if(dbUser){

          token.role = dbUser.role;
          token.churchId = dbUser.churchId;

        }


        token.roleCheckedAt = Date.now();
      }


      return token;
    },


    /**
     * SESSION FRONTEND
     */
    async session({ session, token }) {

      if(session.user){

        (session.user as any).id =
          token.id;

        (session.user as any).role =
          token.role ?? "USER";

        (session.user as any).churchId =
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
 * 🎙️ Accès Studio Radio
 *
 * Retourne :
 * utilisateur +
 * rôle +
 * église associée
 */
export async function requireStudioAccess(){

  const session =
    await getServerSession(authOptions);


  const userId =
    (session?.user as any)?.id;


  if(!userId){
    return null;
  }


  const dbUser =
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



  if(!dbUser){
    return null;
  }



  if(
    !STUDIO_ROLES.includes(dbUser.role)
  ){
    return null;
  }



  /**
   * Priorité :
   * 1 User.churchId
   * 2 ChurchAdmin
   */
  const churchId =
    dbUser.churchId ??
    dbUser.churchAdmins[0]?.churchId ??
    null;



  return {

    id:dbUser.id,

    email:dbUser.email,

    name:dbUser.name,

    image:dbUser.image,

    role:dbUser.role,

    churchId,

  };
}



/**
 * 📻 Vérifie gestion d'une radio
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



  if(radio.userId === userId){
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
 * 👑 Vérification admin globale
 */
export async function requireAdmin(){

  const session =
    await getServerSession(authOptions);



  const userId =
    (session?.user as any)?.id;



  if(!userId){
    return null;
  }



  const dbUser =
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
    !dbUser ||
    ![
      "ADMIN",
      "SUPER_ADMIN",
    ].includes(dbUser.role)
  ){
    return null;
  }



  return dbUser;
}