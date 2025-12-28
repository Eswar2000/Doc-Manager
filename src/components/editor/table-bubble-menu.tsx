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
    ListX,
    TableColumnsSplit,
    CornerUpLeft,
    CornerDownLeft,
    CornerRightDown,
    CornerLeftDown
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
                offset: 16,
            }}
            shouldShow={({ editor }) => editor.isActive("table")}
        >
            <TooltipProvider>
                <div className="flex items-center gap-1 rounded-md border bg-white p-2 shadow-lg">
                    {/* Insert Row Above */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().addRowBefore().run()}
                            >
                                <CornerUpLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Insert row above</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Insert Row Below */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                            >
                                <CornerDownLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Insert row below</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Delete Row */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().deleteRow().run()}
                                className="text-red-600 hover:text-red-700"
                            >
                                <ListX className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete row</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Insert Column Left */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().addColumnBefore().run()}
                            >
                                <CornerLeftDown className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Insert column left</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Insert Column Right */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                            >
                                <CornerRightDown className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Insert column right</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Delete Column */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                className="text-red-600 hover:text-red-700"
                            >
                                <TableColumnsSplit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete column</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Delete Table */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete table</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </BubbleMenu>
    );
};