import React, { useCallback, useState } from "react";
import { useDropzone, generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing/core";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";
import { Input } from "./ui/input";
import { type Editor } from "@tiptap/react";

const UploadDropzone = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { useUploadThing } = generateReactHelpers<OurFileRouter>();

  const { startUpload, routeConfig } = useUploadThing("imageUploader", {
    onClientUploadComplete: (images) => {
      images.map((image) => {
        editor.chain().focus().setImage({ src: image.url }).run();
      });
      alert("uploaded successfully!");
    },
    onUploadError: () => {
      alert("error occurred while uploading");
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file);
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <ImagePlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-1/2">
        <DialogHeader>
          <DialogTitle>Upload Image(s)</DialogTitle>
          <DialogDescription>Dropzone for uploading images</DialogDescription>
        </DialogHeader>
        <div
          {...getRootProps()}
          className="flex min-h-[40vh] items-center justify-center rounded-md border-2 border-dashed p-5"
        >
          <Input {...getInputProps()} />
          Drop files here!
        </div>
        <DialogFooter>
          {files.length > 0 && (
            <Button onClick={() => startUpload(files)}>
              Upload {files.length} files
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDropzone;

/* sample shape of object images in onClientUploadComplete
[
    {
      url: 'https://sea1.ingest.uploadthing.com/G6OAJNvYGb4QXFlYT5mkxup07UZbfirONQB569HFvaJcKDln?expires=1730270520061&x-ut-identifier=klxamlxj35&x-ut-file-name=Luffy.jpg&x-ut-file-size=2849456&x-ut-file-type=image%252Fjpeg&x-ut-slug=imageUploader&x-ut-content-disposition=inline&signature=hmac-sha256%3Dc39359aefea386d2e23d17f1f8d3662e5675481ed5e311b9b6bb7bcaff66cbb2',
      key: 'G6OAJNvYGb4QXFlYT5mkxup07UZbfirONQB569HFvaJcKDln',
      name: 'Luffy.jpg',
      customId: null
    }
  ]
*/
