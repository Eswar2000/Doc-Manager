import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Typography from "@tiptap/extension-typography";
import { Mark } from "@tiptap/core";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    ImageIcon,
    TableIcon
} from "lucide-react";

// Custom Fontsize extension
const FontSize = Mark.create({
    name: "fontSize",

    addAttributes() {
        return {
            fontSize: {
                default: null,
                parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
                renderHTML: (attrs) => {
                    if (!attrs.fontSize) return {};
                    return { style: `font-size: ${attrs.fontSize}` };
                },
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", HTMLAttributes, 0];
    },

    addCommands() {
        return {
            setFontSize:
                (size: string) =>
                    ({ commands }) =>
                        commands.setMark(this.name, { fontSize: size }),
            unsetFontSize:
                () =>
                    ({ commands }) =>
                        commands.unsetMark(this.name),
        };
    },
});

interface TemplateEditorProps {
    initialContent?: string;
    onChange?: (html: string) => void;
    placeholders?: { id: string; label: string }[];
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
    initialContent = "",
    onChange,
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                    HTMLAttributes: { class: "list-disc pl-6" },
                },
                orderedList: {
                    keepMarks: true,
                    HTMLAttributes: { class: "list-decimal pl-6" },
                },
            }),
            Underline,
            Typography,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Image.configure({ inline: true, allowBase64: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            FontFamily,
            FontSize,
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "outline-none min-h-screen p-12 prose max-w-none [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold",
            },
        },
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });

    if (!editor) return null;

    const setFontFamily = (font: string) => {
        editor.chain().focus().setFontFamily(font).run();
    };

    const setFontSize = (size: string) => {
        editor.chain().focus().setFontSize(size).run();
    };

    const addImage = () => {
        const url = window.prompt("Image URL");
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const insertTable = () => {
        editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-gray-50">
                {/* <Select
                    value={
                        editor.isActive("heading", { level: 1 }) ? "h1" :
                            editor.isActive("heading", { level: 2 }) ? "h2" :
                                editor.isActive("heading", { level: 3 }) ? "h3" :
                                    "p"
                    }
                    onValueChange={(value) => {
                        const commands = editor.chain().focus();

                        if (value === "p") {
                            commands.clearNodes().setParagraph().run();
                        } else if (value === "h1") {
                            commands.clearNodes().setHeading({ level: 1 }).run();
                        } else if (value === "h2") {
                            commands.clearNodes().setHeading({ level: 2 }).run();
                        } else if (value === "h3") {
                            commands.clearNodes().setHeading({ level: 3 }).run();
                        }
                    }}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="p">Paragraph</SelectItem>
                        <SelectItem value="h1">Heading 1</SelectItem>
                        <SelectItem value="h2">Heading 2</SelectItem>
                        <SelectItem value="h3">Heading 3</SelectItem>
                    </SelectContent>
                </Select> */}
                <Select onValueChange={setFontFamily}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Inter">Inter (default)</SelectItem>
                        <SelectItem value="Arial, Helvetica, sans-serif">Arial</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Times New Roman, Times, serif">Times New Roman</SelectItem>
                        <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={setFontSize}>
                    <SelectTrigger className="w-24">
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="12px">12</SelectItem>
                        <SelectItem value="14px">14</SelectItem>
                        <SelectItem value="16px">16</SelectItem>
                        <SelectItem value="18px">18</SelectItem>
                        <SelectItem value="24px">24</SelectItem>
                        <SelectItem value="32px">32</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px h-8 bg-gray-300 mx-2" />

                <Button
                    variant={editor.isActive("bold") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="font-semibold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive("italic") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive("underline") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive("strike") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                {/* vertical divider */}
                <div className="w-px h-8 bg-gray-300 mx-2" />

                <Button
                    variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>

                {/* vertical divider */}
                <div className="w-px h-8 bg-gray-300 mx-2" />

                <Button
                    variant={editor.isActive("bulletList") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive("orderedList") ? "default" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={addImage}>
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={insertTable}>
                    <TableIcon className="h-4 w-4" />
                </Button>

                <div className="flex-1" />
            </div>

            {/* Editor area */}
            <EditorContent editor={editor} className="flex-1 overflow-auto bg-white p-12" />
        </div>
    );
};

export default TemplateEditor;