// src/editor/attribute-field.tsx
import { Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attributeField: {
      insertAttributeField: (label: string) => ReturnType;
    };
  }
}

export const AttributeField = Node.create({
  name: "attributeField",

  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      label: {
        default: "Field",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-attribute-field]' }];
  },

  renderHTML({ node }) {
    const { label } = node.attrs as { label: string };

    return [
      "span",
      {
        "data-attribute-field": "",
        contenteditable: "false", // Fixes cursor trapping inside
        style: "font: inherit; vertical-align: middle;",
        class: "inline-block align-middle mx-1 px-2 py-px bg-blue-100 text-blue-800 border border-dashed border-blue-500 rounded select-none cursor-pointer leading-none",
      },
      `{{ ${label} }}`,
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      dom.textContent = `{{ ${node.attrs.label} }}`;
      dom.contentEditable = "false";
      dom.className = "inline-block align-middle mx-1 px-2 py-px bg-blue-100 text-blue-800 border border-dashed border-blue-500 rounded select-none cursor-pointer leading-none";
      dom.setAttribute("data-attribute-field", "");
      // ensure it inherits the surrounding font and is vertically centered in the line
      dom.style.font = "inherit";
      dom.style.verticalAlign = "middle";
      return { dom };
    };
  },

  addCommands() {
    return {
      insertAttributeField:
        (label: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { label },
          });
        },
    };
  },
});