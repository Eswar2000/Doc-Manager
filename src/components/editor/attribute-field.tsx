import { Node } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attributeField: {
      insertAttributeField: (options: {
        label: string;
        fieldKey?: string | null;
        required?: boolean;
        hidden?: boolean;
        defaultValue?: string | null;
      }) => ReturnType;
    };
  }
}

// Helper to truncate long texts
const truncateDefault = (value: string | null, maxLength = 20) => {
  if (!value) return "";
  return value.length > maxLength
    ? value.slice(0, maxLength - 3) + "..."
    : value;
};

export const AttributeField = Node.create({
  name: "attributeField",

  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      label: { default: "Field" },
      trackerId: { default: null },
      required: { default: false },
      hidden: { default: false },
      defaultValue: { default: null },
      fieldKey: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-attribute-field]' }];
  },

  renderHTML({ node }) {
    const attrs = node.attrs as {
      label: string;
      trackerId: string | null;
      required: boolean;
      hidden: boolean;
      defaultValue: string | null;
    };

    // Hidden fields: render invisible span (keeps data but shows nothing)
    if (attrs.hidden) {
      return [
        "span",
        {
          "data-attribute-field": "",
          "tracker-id": attrs.trackerId ?? "",
          style: "display: none;",
        },
        "",
      ];
    }

    // Visible fields
    const truncatedDefault = truncateDefault(attrs.defaultValue);
    const displaySuffix = truncatedDefault ? ` (${truncatedDefault})` : "";

    const textContent = `{{ ${attrs.label}${displaySuffix} }}`;

    const baseClasses =
      "inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150";

    const colorClasses = attrs.required
      ? "bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400"
      : "bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 hover:border-blue-400";

    return [
      "span",
      {
        "data-attribute-field": "",
        "tracker-id": attrs.trackerId ?? "",
        contenteditable: "false",
        class: `${baseClasses} ${colorClasses}`,
      },
      textContent,
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const attrs = node.attrs as {
        label: string;
        trackerId: string | null;
        required: boolean;
        hidden: boolean;
        defaultValue: string | null;
      };

      // Hidden: render invisible placeholder
      if (attrs.hidden) {
        const dom = document.createElement("span");
        dom.style.display = "none";
        dom.setAttribute("data-attribute-field", "");
        if (attrs.trackerId) dom.setAttribute("tracker-id", attrs.trackerId);
        return { dom };
      }

      // Visible field
      const dom = document.createElement("span");

      const truncatedDefault = truncateDefault(attrs.defaultValue);
      const displaySuffix = truncatedDefault ? ` (${truncatedDefault})` : "";

      dom.textContent = `{{ ${attrs.label}${displaySuffix} }}`;
      dom.contentEditable = "false";
      dom.setAttribute("data-attribute-field", "");
      if (attrs.trackerId) dom.setAttribute("tracker-id", attrs.trackerId);

      const baseClasses =
        "inline-block align-middle mx-1 px-3 py-1 text-sm font-medium rounded-lg shadow-sm select-none cursor-pointer transition-all duration-150";

      const colorClasses = attrs.required
        ? "bg-red-50 text-red-800 border border-red-300 hover:bg-red-100 hover:border-red-400"
        : "bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 hover:border-blue-400";

      dom.className = `${baseClasses} ${colorClasses}`;

      return { dom };
    };
  },

  addCommands() {
    return {
      insertAttributeField:
        ({
          label,
          fieldKey,
          required = false,
          hidden = false,
          defaultValue = null,
        }: {
          label: string;
          fieldKey?: string | null;
          required?: boolean;
          hidden?: boolean;
          defaultValue?: string | null;
        }) =>
          ({ tr, dispatch, editor }) => {
            const trackerId = uuidv4();

            const node = editor.schema.nodes.attributeField.create({
              label,
              trackerId,
              fieldKey,
              required,
              hidden,
              defaultValue,
            });

            if (dispatch) {
              const { selection } = tr;
              const marks = selection.$from.marks();

              let newTr = tr.insert(selection.from, node);

              // Hidden nodes have nodeSize 1, visible ones are larger
              const offset = hidden ? 1 : node.nodeSize;

              const zeroWidthSpace = editor.schema.text("\u200B", marks);
              newTr = newTr.insert(selection.from + offset, zeroWidthSpace);

              const posAfter = selection.from + offset + 1;
              newTr = newTr.setSelection(TextSelection.create(newTr.doc, posAfter));

              dispatch(newTr);
            }

            return true;
          },
    };
  },
});