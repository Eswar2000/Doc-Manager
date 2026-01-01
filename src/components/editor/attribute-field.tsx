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
        style: `
          font-size: inherit;
          line-height: inherit;
          font-weight: inherit;
          font-style: inherit;
          vertical-align: baseline;
          display: inline;
        `,
        class:
          "mx-1 px-2 bg-blue-100 text-blue-800 border border-dashed border-blue-500 rounded select-none cursor-pointer",
      },
      `{{ ${label} }}`,
    ];
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