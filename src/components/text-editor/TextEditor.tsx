"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Toolbar from "./Toolbar";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";

const TextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      ImageResize,
      ListItem,
      OrderedList.configure({
        itemTypeName: "listItem",
        keepMarks: true,
        keepAttributes: true,
      }),
      BulletList.configure({
        itemTypeName: "listItem",
        keepMarks: true,
        keepAttributes: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert prose-ol:{utility} prose-ul:{utility} prose-li:{utility} max-w-none space-y-0.5 min-h-[150px] \
          cursor-text rounded-md border p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 m-5",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col gap-2">
      <Toolbar editor={editor} />
      <EditorContent style={{ whiteSpace: "pre-line" }} editor={editor} />
    </div>
  );
};

export default TextEditor;
