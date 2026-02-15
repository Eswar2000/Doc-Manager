import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { TextSelection } from "prosemirror-state";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        conditionalBlock: {
            insertConditionalBlock: (options: {
                condition?: {
                    fieldKey: string;
                    operator: string;
                    value: string;
                } | null;
                action?: "show" | "hide";
            }) => ReturnType;
            wrapInConditionalBlock: (options: {
                condition?: {
                    fieldKey: string;
                    operator: string;
                    value: string;
                } | null;
                action?: "show" | "hide";
            }) => ReturnType;
        };
    }
}

const ConditionalBlockComponent = (props: any) => {
    const { node, editor, getPos } = props;
    const attrs = node.attrs as {
        id: string | null;
        condition: { fieldKey: string; operator: string; value: string } | null;
        action: "show" | "hide";
    };

    const isShow = attrs.action === "show";

    let conditionLabel = "Unconfigured rule";
    if (attrs.condition?.fieldKey) {
        const op = attrs.condition.operator.replace(/_/g, " ");
        conditionLabel = `${attrs.condition.fieldKey} ${op} "${attrs.condition.value}"`;
    }

    const bannerClasses = cn(
        "absolute -top-3.5 left-4 z-10 flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium shadow-sm border",
        isShow
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-amber-50 text-amber-800 border-amber-200",
        "group-hover:bg-white group-hover:border-indigo-300 group-hover:shadow-md transition-colors"
    );

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log("Edit conditional block:", attrs.id, attrs.condition, attrs.action);
        // → Later: open your rule dialog here, pass attrs.id and getPos()
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editor.isEditable) return;

        const pos = typeof getPos === "function" ? getPos() : -1;
        if (pos < 0) return;

        editor
            .chain()
            .focus()
            .command(({ tr }: { tr: any }) => {
                const blockNode = tr.doc.nodeAt(pos);
                if (blockNode) {
                    // Unwrap: replace the block with its own content
                    tr.replaceWith(pos, pos + blockNode.nodeSize, blockNode.content);
                }
                return true;
            })
            .run();
    };

    return (
        <NodeViewWrapper
            className={cn(
                "relative my-4 rounded-md border-2 border-dashed",
                "border-indigo-300/70 bg-indigo-50/15 dark:bg-indigo-950/10",
                "transition-all duration-150",
                editor.isEditable && "group hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/25"
            )}
            data-type="conditional-block"
        >
            {/* Banner */}
            <div className={bannerClasses}>
                {isShow ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span className="ml-1.5">
                    {isShow ? "Show if" : "Hide if"} {conditionLabel}
                </span>

                {editor.isEditable && (
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Content area */}
            <NodeViewContent
                className={cn(
                    "min-h-[3.5rem] p-6 pt-10 prose prose-sm sm:prose max-w-none",
                    !editor.isEditable && "pointer-events-none"
                )}
            />
        </NodeViewWrapper>
    );
};

export const ConditionalBlock = Node.create({
    name: "conditionalBlock",

    group: "block",
    content: "block+",

    defining: true,
    draggable: true,

    addAttributes() {
        return {
            id: { default: null },
            condition: { default: null },
            action: { default: "show" },
        };
    },

    parseHTML() {
        return [{ tag: "div[data-type='conditional-block']" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", { ...HTMLAttributes, "data-type": "conditional-block" }, 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ConditionalBlockComponent);
    },

    addCommands() {
        return {
            insertConditionalBlock:
                ({
                    condition = null,
                    action = "show",
                }: {
                    condition?: { fieldKey: string; operator: string; value: string } | null;
                    action?: "show" | "hide";
                } = {}) =>
                    ({ tr, dispatch, editor }) => {
                        const id = uuidv4();

                        const node = editor.schema.nodes.conditionalBlock.create(
                            { id, condition, action },
                            [
                                editor.schema.nodes.paragraph.create({}, [
                                    editor.schema.text("Conditional content – edit or replace me"),
                                ]),
                            ]
                        );

                        if (dispatch) {
                            const { selection } = tr;
                            const from = selection.from;

                            let newTr = tr.insert(from, node);

                            // Place cursor inside the block (after opening tag)
                            const posAfter = from + 1;
                            newTr = newTr.setSelection(TextSelection.create(newTr.doc, posAfter));

                            dispatch(newTr);
                        }

                        return true;
                    },

            wrapInConditionalBlock:
                ({
                    condition = null,
                    action = "show",
                }: {
                    condition?: { fieldKey: string; operator: string; value: string } | null;
                    action?: "show" | "hide";
                } = {}) =>
                    ({ tr, dispatch, editor }) => {
                        const id = uuidv4();

                        if (dispatch) {
                            const { selection } = tr;
                            const from = selection.from;
                            const to = selection.to;

                            if (from === to) {
                                const id = uuidv4();

                                const content = editor.schema.nodes.paragraph.create({}, [
                                    editor.schema.text("Conditional content – edit me"),
                                ]);

                                const block = editor.schema.nodes.conditionalBlock.create(
                                    {
                                        id,
                                        condition: condition ?? null,
                                        action: action ?? "show",
                                    },
                                    content
                                );

                                tr.insert(from, block);

                                // Place cursor inside
                                tr.setSelection(TextSelection.create(tr.doc, from + 1));

                                dispatch(tr);
                                return true;
                            }

                            const wrapper = editor.schema.nodes.conditionalBlock.create(
                                { id, condition, action },
                                tr.doc.slice(from, to).content
                            );

                            let newTr = tr.replaceWith(from, to, wrapper);

                            // Place cursor inside the wrapper
                            const posInside = from + 1;
                            newTr = newTr.setSelection(TextSelection.create(newTr.doc, posInside));

                            dispatch(newTr);
                        }

                        return true;
                    },
        };
    },
});