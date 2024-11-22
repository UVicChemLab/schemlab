import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "~/actions/profile";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
    video: {
      maxFileSize: "16MB",
    },
  })
    .middleware(async ({}) => {
      const user = await getCurrentUser();

      if (!user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { image: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
