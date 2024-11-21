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
import React from "react";
import { type Editor } from "@tiptap/react";

export type Groups = {
  key: string;
  name: string;
  icon: React.ReactNode;
  action: (editor: Editor) => boolean;
  disabled?: (editor: Editor) => boolean;
}[];

const toggleStyle = "h-4 w-4";

export const textAdjustments = [
  {
    key: "text-adjustment-bold",
    name: "bold",
    action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    icon: <Bold className={toggleStyle} />,
  },
  {
    key: "text-adjustment-italic",
    name: "italic",
    action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
    icon: <Italic className={toggleStyle} />,
  },
  {
    key: "text-adjustment-underline",
    name: "underline",
    action: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
    icon: <Underline className={toggleStyle} />,
  },
];

export const textAlignments = [
  {
    key: "text-alignment-blockquote",
    name: "blockquote",
    action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    icon: <TextQuote className={toggleStyle} />,
  },
  {
    key: "text-alignment-left",
    name: "left",
    action: (editor: Editor) =>
      editor.chain().focus().setTextAlign("left").run(),
    icon: <AlignLeft className={toggleStyle} />,
  },
  {
    key: "text-alignment-center",
    name: "center",
    action: (editor: Editor) =>
      editor.chain().focus().setTextAlign("center").run(),
    icon: <AlignCenter className={toggleStyle} />,
  },
  {
    key: "text-alignment-right",
    name: "right",
    action: (editor: Editor) =>
      editor.chain().focus().setTextAlign("right").run(),
    icon: <AlignRight className={toggleStyle} />,
  },
  {
    key: "text-alignment-justify",
    name: "justify",
    action: (editor: Editor) =>
      editor.chain().focus().setTextAlign("justify").run(),
    icon: <AlignJustify className={toggleStyle} />,
  },
  {
    key: "text-alignment-bulletList",
    name: "bulletList",
    action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    icon: <List className={toggleStyle} />,
  },
  {
    key: "text-alignment-orderedList",
    name: "orderedList",
    action: (editor: Editor) =>
      editor.chain().focus().toggleOrderedList().run(),
    icon: <ListOrdered className={toggleStyle} />,
  },
];
