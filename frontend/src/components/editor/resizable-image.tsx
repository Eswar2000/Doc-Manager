import React, { useState } from "react";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";


const ResizableImageComponent: React.FC<{
  node: PMNode;
  updateAttributes: (attrs: Record<string, any>) => void;
  selected: boolean;
}> = ({ node, updateAttributes, selected }) => {
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    // Prevent browser zoom & text selection
    document.body.style.cursor = "se-resize";
    document.body.style.userSelect = "none";

    const img = e.currentTarget.parentElement?.querySelector("img") as HTMLImageElement;
    if (!img) return;

    const startX = e.clientX;
    const startWidth = img.offsetWidth;
    const aspectRatio = img.naturalWidth / img.naturalHeight || 1;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);

      updateAttributes({
        width: `${newWidth}px`,
        height: `${newWidth / aspectRatio}px`,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <NodeViewWrapper className="inline-block align-bottom">
      <div
        contentEditable={false}
        className={`
          inline-block relative group rounded-md overflow-hidden
          ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
          transition-shadow
        `}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          draggable={false}
          className={`
            align-bottom max-w-none
            ${isResizing ? "select-none pointer-events-none" : ""}
          `}
          style={{
            width: node.attrs.width || "auto",
            height: node.attrs.height || "auto",
            maxWidth: "100%",
          }}
        />

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`
            absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full cursor-se-resize
            border-2 border-white shadow-xl translate-x-1/2 translate-y-1/2 z-10
            opacity-0 group-hover:opacity-100 transition-opacity
            ${selected ? "opacity-100" : ""}
          `}
        />
      </div>
    </NodeViewWrapper>
  );
};


export const ResizableImage = Image.extend({
  name: "image",
  group: "inline",
  inline: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      alt: { default: null },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          return {
            src: el.getAttribute("src"),
            alt: el.getAttribute("alt"),
            width: el.style.width || null,
            height: el.style.height || null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const style = [
      HTMLAttributes.width ? `width: ${HTMLAttributes.width}` : "",
      HTMLAttributes.height ? `height: ${HTMLAttributes.height}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    return ["img", { ...HTMLAttributes, style: style || undefined }];
  },
});