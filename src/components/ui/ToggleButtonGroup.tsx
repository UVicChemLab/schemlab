"use client";

import React from "react";
import { type Groups } from "~/lib/togglegroups";
import { ToggleGroup } from "./toggle-group";
import { Toggle } from "./toggle";
import { type Editor } from "@tiptap/react";

const ToggleButtonGroup = ({
  editor,
  group,
}: {
  editor: Editor;
  group: Groups;
}) => {
  return (
    <ToggleGroup type="multiple">
      {group.map((item) => (
        <Toggle
          key={item.key}
          pressed={editor.isActive(item.name)}
          onPressedChange={() => item.action(editor)}
          value={item.name}
          aria-label={`Toggle ${item.name}`}
        >
          {item.icon}
        </Toggle>
      ))}
    </ToggleGroup>
  );
};

export default ToggleButtonGroup;
