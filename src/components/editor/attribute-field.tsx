import { Node } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";

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
        contenteditable: "false",
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
      dom.style.font = "inherit";
      dom.style.verticalAlign = "middle";
      return { dom };
    };
  },

  addCommands() {
    return {
      insertAttributeField:
        (label: string) =>
          ({ tr, dispatch, editor }) => {
            const { selection } = tr;
            const node = editor.schema.nodes.attributeField.create({ label });

            if (dispatch) {
              // Capture current marks
              const marks = selection.$from.marks();

              // Insert the atomic node
              let newTr = tr.insert(selection.from, node);

              // Insert a zero-width space with the marks to restore them
              const zeroWidthSpace = editor.schema.text('\u200B', marks);
              newTr = newTr.insert(selection.from + node.nodeSize, zeroWidthSpace);

              // Move cursor after the zero-width space
              const posAfter = selection.from + node.nodeSize + 1;
              newTr = newTr.setSelection(TextSelection.create(newTr.doc, posAfter));

              dispatch(newTr);
            }

            return true;
          },
    };
  },
});