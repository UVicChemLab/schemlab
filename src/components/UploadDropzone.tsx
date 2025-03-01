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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";
import { Input } from "./ui/input";
import { type Editor } from "@tiptap/react";
import { useToast } from "~/hooks/use-toast";
import { formatBytes } from "~/lib/utils";
import { DialogClose } from "@radix-ui/react-dialog";

const UploadDropzone = ({ editor }: { editor: Editor }) => {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);
  const { toast } = useToast();

  const { useUploadThing } = generateReactHelpers<OurFileRouter>();

  const { startUpload, routeConfig } = useUploadThing("imageUploader", {
    onClientUploadComplete: (images) => {
      editor.commands.focus("end");
      images.forEach((image) => {
        editor
          .chain()
          .insertContent(
            `<img src="${image.url}" class="enlargeable-image cursor-pointer transition-transform duration-300 ease-in-out" /><br>`,
          )
          .focus("end")
          .run();
      });
      toast({
        title: "Images uploaded successfully",
        description: "Images uploaded successfully",
      });
    },
    onUploadError: (e) => {
      console.log(e);
      toast({
        title: "Something went wrong",
        description: "Images could not be uploaded",
      });
    },
    onUploadBegin: (file) => {
      toast({
        title: "Uploading...",
        description: file,
      });
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
  });

  if (!editor) {
    return null;
  }

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
        {files.length > 0 && (
          <Table>
            <TableCaption>Images Ready for Upload</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">Image Name</TableHead>
                <TableHead className="text-right">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.name}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="text-right">
                    {formatBytes(file.size)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div
          {...getRootProps()}
          className="flex min-h-[20vh] cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-5"
        >
          <Input {...getInputProps()} />
          Drop files here!
        </div>
        <DialogFooter>
          <DialogClose asChild>
            {files.length > 0 && (
              <Button
                onClick={() => startUpload(files).then(() => setFiles([]))}
              >
                Upload {files.length} files
              </Button>
            )}
          </DialogClose>
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
