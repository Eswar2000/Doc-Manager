import React from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Trash2,
  CornerUpLeft,
  CornerDownLeft,
  ListX,
  CornerLeftDown,
  CornerRightDown,
  TableColumnsSplit,
} from "lucide-react";

interface TableBubbleMenuProps {
  editor: Editor;
}

export const TableBubbleMenu: React.FC<TableBubbleMenuProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        offset: 12,
      }}
      shouldShow={({ editor }) => editor.isActive("table")}
    >
      <TooltipProvider delayDuration={300}>
        <div
          className="flex items-start gap-6 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-lg"
          style={{ boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)" }}
        >
          {/* Row Options Group */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[12px] font-semibold text-gray-700 leading-none">Row Options</span>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editor.chain().focus().addRowBefore().run()}>
                    <CornerUpLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert row above</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editor.chain().focus().addRowAfter().run()}>
                    <CornerDownLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert row below</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => editor.chain().focus().deleteRow().run()}>
                    <ListX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete row</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="h-10 w-px bg-gray-300" />

          {/* Column Options Group */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[12px] font-semibold text-gray-700 leading-none">Column Options</span>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                    <CornerLeftDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert column left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                    <CornerRightDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Insert column right</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => editor.chain().focus().deleteColumn().run()}>
                    <TableColumnsSplit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete column</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="h-10 w-px bg-gray-300" />

          {/* Table Options Group */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[12px] font-semibold text-gray-700 leading-none">Table Options</span>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => editor.chain().focus().deleteTable().run()}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete table</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
};