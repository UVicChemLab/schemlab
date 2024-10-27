import React from "react";
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Underline,
  Quote,
  TextQuote,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { type Editor } from "@tiptap/react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Toggle } from "../ui/toggle";
import { Separator } from "../ui/separator";
import ToggleButtonGroup from "../ui/ToggleButtonGroup";
import { textAdjustments, textAlignments } from "~/lib/togglegroups";

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
    </div>
  );
};

export default Toolbar;
