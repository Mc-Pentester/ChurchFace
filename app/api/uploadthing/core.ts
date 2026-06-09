import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id;
      if (!userId) {
        throw new Error("Non autorisé");
      }
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("UPLOAD:", file.url, file.type);

      return {
        url: file.url,
        type: file.type,
      };
    }),

  audioUploader: f({
    audio: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id;
      if (!userId) {
        throw new Error("Non autorisé");
      }
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("AUDIO UPLOAD:", file.url, file.type);
      return { url: file.url, type: file.type, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;