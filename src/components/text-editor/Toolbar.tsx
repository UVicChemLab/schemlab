import React from "react";
import { type Editor } from "@tiptap/react";
import { Separator } from "../ui/separator";
import ToggleButtonGroup from "../ui/ToggleButtonGroup";
import { textAdjustments, textAlignments } from "~/lib/togglegroups";
import UploadDropzone from "../UploadDropzone";

type Props = {
  editor: Editor | null;
  content?: string;
};
const Toolbar = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="flex items-center gap-2">
      <ToggleButtonGroup editor={editor} group={textAdjustments} />
      <Separator orientation="vertical" className="mx-2 h-7" />
      <ToggleButtonGroup editor={editor} group={textAlignments} />
      <Separator orientation="vertical" className="mx-2 h-7" />
      <UploadDropzone />
    </div>
  );
};

export default Toolbar;
