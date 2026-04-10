import React from "react";
import Editor from "../editor/editor";
import DynamicDialog from "../dialog-box/dynamic-dialog";
import type { Placeholder, EditorInitialData, DynamicField, AttributeProps, AttributeType } from "../../types/index";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "@/api/templates";
import { attributeApi } from "@/api/attributes";

import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "../ui/spinner";
import { TextSelection } from "prosemirror-state";


export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initialData = location.state?.initialData as EditorInitialData | undefined;
  const mode = location.state?.mode || "template";

  const {
    data: attributes = [],
    // isLoading: isAttributesLoading,
    // isError: isAttributesError,
    // error: attributesError,
  } = useQuery<AttributeProps[]>({
    queryKey: ['attributes'],
    queryFn: attributeApi.fetchAttributes,
    staleTime: 3000 * 60,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  const [editor, setEditor] = React.useState<any>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [name, setName] = React.useState(initialData?.name || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [attributeConfig, setAttributeConfig] = React.useState<
    Record<
      string,
      {
        required: boolean;
        hidden: boolean;
        defaultValue: string | null;
      }
    >
  >({});
  const [attributeCounts, setAttributeCounts] = React.useState<Record<string, number>>({});
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [overridePromptOpen, setOverridePromptOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedPlaceholder, setSelectedPlaceholder] = React.useState<Placeholder | null>(null);

  const [required, setRequired] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [defaultValue, setDefaultValue] = React.useState("");

  const [ruleDialogOpen, setRuleDialogOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<{
    id: string | null; // if null, then new rule
    pos?: number; // only for editing (existing rules)
    // multiple conditions support: { join: 'and'|'or', items: [{fieldKey, operator, value}] }
    condition: { join?: 'and' | 'or'; items: { fieldKey: string; operator: string; value: string }[] } | null;
    action: "show" | "hide";
    name: string;
  } | null>(null);
  const [rules, setRules] = React.useState<Array<{ id: string | null; pos: number; condition: any; action: "show" | "hide"; name: string }>>([]);

  const getRuleDialogFields = (): DynamicField[] => {
    const usedAttributes = attributes.filter(attr => attributeCounts[attr.id.toString()] > 0);
    // Build operator map keyed by attribute name
    const operatorMap: Record<string, string[]> = {};
    usedAttributes.forEach((attr) => {
      const t = (attr as any).type as string | undefined;
      if (t === 'number' || t === 'date') {
        operatorMap[attr.name] = ['equals', 'not_equals', 'greater_than', 'greater_than_or_equal', 'less_than', 'less_than_or_equal', 'exists'];
      } else if (t === 'text' || t === 'email') {
        operatorMap[attr.name] = ['equals', 'not_equals', 'contains', 'exists'];
      } else {
        // fallback to text-like operators
        operatorMap[attr.name] = ['equals', 'not_equals', 'contains', 'exists'];
      }
    });

    return [
      { name: "name", label: "Rule name", type: "text", required: true, maxLength: 100 },
      { name: "conditions", label: "Conditions (combine with AND / OR)", type: "conditions", required: true, options: usedAttributes.map(attr => attr.name), operatorOptions: operatorMap },
      { name: "action", label: "Action when condition is true", type: "select", required: true, options: ["show", "hide"] },
    ];
  }

  // Recalculate counts by scanning the document
  const recalculateFieldCounts = () => {
    if (!editor) return;

    const newCounts: Record<string, number> = {};
    const usedFieldKeys = new Set<string>();

    editor.state.doc.descendants((node: any) => {
      if (node.type.name === "attributeField" && node.attrs.fieldKey) {
        const fieldKey = node.attrs.fieldKey as string;
        newCounts[fieldKey] = (newCounts[fieldKey] || 0) + 1;
        usedFieldKeys.add(fieldKey);
      }
    });

    setAttributeCounts(newCounts);

    // Clean up stale configs: remove entries for field types no longer in use
    setAttributeConfig((prev) => {
      const updated = { ...prev };
      let changed = false;

      Object.keys(updated).forEach((key) => {
        if (!usedFieldKeys.has(key)) {
          delete updated[key];
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  };

  // initial rules scan
  const scanRules = () => {
    const found: Array<{ id: string | null; pos: number; condition: any; action: "show" | "hide"; name: string }> = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type && node.type.name === 'conditionalBlock') {
        found.push({ id: node.attrs?.id ?? null, pos, condition: node.attrs?.condition ?? null, action: node.attrs?.action ?? 'show', name: node.attrs?.name ?? '' });
      }
    });
    setRules(found);
  };

  // Safe real-time sync on every document change
  React.useEffect(() => {
    if (editor) {
      recalculateFieldCounts(); // Initial count

      scanRules();

      const handler = ({ transaction }: { transaction: any }) => {
        if (transaction.docChanged) {
          // Queue to next tick — prevents infinite update loops
          setTimeout(() => {
            recalculateFieldCounts();
            scanRules();
          }, 0);
        }
      };

      editor.on("transaction", handler);

      return () => {
        editor.off("transaction", handler);
      };
    }
  }, [editor]);

  // Listen for edit events dispatched from the conditional block node view
  React.useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      const { id, pos, condition, action, name } = detail;
      setEditingRule({ id: id ?? null, pos, condition: condition ?? null, action: action ?? 'show', name: name ?? '' });
      setRuleDialogOpen(true);
    };

    window.addEventListener('edit-conditional-block', handler);
    return () => window.removeEventListener('edit-conditional-block', handler);
  }, []);

  // Load editor content when initialData is provided (when editing existing templates or snippets)
  React.useEffect(() => {
    if (editor && initialData?.jsonContent) {
      editor.commands.setContent(initialData.jsonContent);
      recalculateFieldCounts();
    }
  }, [editor, initialData]);

  // Load attribute config from initialData (when editing existing templates or snippets)
  React.useEffect(() => {
    if (initialData?.attributesConfig) {
      setAttributeConfig(initialData.attributesConfig);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);

    const html = editor.getHTML();
    const json = editor.getJSON();

    // Map to collect trackerIds per label
    const attributeMap = new Map<
      string,
      {
        attributeId: string;
        label: string;
        trackerIds: string[];
        required: boolean;
        hidden: boolean;
        type: AttributeType;
        defaultValue: string | null;
      }>();

    // Traverse document to collect trackerIds per label
    editor.state.doc.descendants((node: any) => {
      if (node.type.name === "attributeField") {
        const { label, trackerId, fieldKey } = node.attrs as {
          label: string;
          trackerId: string;
          fieldKey: string | null;
        };

        if (label && trackerId && fieldKey) {
          const attributeId = fieldKey;

          // Get config from our React state
          const config = attributeConfig[fieldKey] || {
            required: false,
            hidden: false,
            defaultValue: null,
          };
          const attributeMeta = attributes.find(a => a.id.toString() === attributeId);

          if (!attributeMap.has(attributeId)) {
            attributeMap.set(attributeId, {
              attributeId,
              label,
              required: config.required,
              hidden: config.hidden,
              type: attributeMeta ? attributeMeta.type : 'text',
              defaultValue: config.defaultValue,
              trackerIds: [],
            });
          }

          attributeMap.get(attributeId)!.trackerIds.push(trackerId);
        }
      }
    });

    const attributesList = Array.from(attributeMap.values());

    const rules: Array<{
      ruleId: string;
      name: string;
      action: "show" | "hide";
      condition: {
        join: "and" | "or";
        items: Array<{ fieldKey: string; operator: string; value?: string }>;
      };
      content: any;
    }> = [];

    // Traverse document again to extract conditional blocks and their content
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type?.name === "conditionalBlock" && node.attrs?.id) {
        const { id, condition, action, name = "Untitled Rule" } = node.attrs;

        // Extract the INNER content as ProseMirror JSON (excluding the wrapper itself)
        const from = pos + 1;
        const to = pos + node.nodeSize - 1;

        let contentJson: any = { type: "doc", content: [] };

        if (from < to) {
          const slice = editor.state.doc.slice(from, to);
          contentJson = slice.toJSON();
        }

        rules.push({
          ruleId: String(id),
          name: String(name || "Untitled Rule"),
          action: (action || "show") as "show" | "hide",
          condition: condition || { join: "and", items: [] },
          content: contentJson,
        });
      }
    });

    const savedData = {
      name,
      description,
      htmlContent: html,
      jsonContent: json,
      attributes: attributesList,
      rules
    };

    try {
      const isCreate = initialData?.id ? false : true;
      console.log("Action:", isCreate ? "Create New" : "Update Existing");
      if (isCreate) {
        if (mode === 'template') {
          await templateApi.createTemplate(savedData);
        } else {
          console.log(`Saved ${mode}:`, JSON.stringify(savedData, null, 2));
        }
      } else {
        if (mode === 'template' && initialData?.id) {
          await templateApi.updateTemplate(initialData.id, savedData);
        } else {
          console.log(`Saved ${mode}:`, JSON.stringify(savedData, null, 2));
        }
      }

      if (mode === 'template') {
        queryClient.invalidateQueries({ queryKey: ['templates'] });
      }

      toast.success(isCreate ? "Successfully created" : "Successfully updated", {
        description: isCreate ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} created successfully.` : `${mode.charAt(0).toUpperCase() + mode.slice(1)} updated successfully.`,
        duration: 2000,
        closeButton: false,
      });

      navigate(mode === 'template' ? '/templates' : '/snippets');
    } catch (err) {
      console.log("Save failed: ", err);

      toast.error("Failed to save", {
        description: err instanceof Error
          ? err.message
          : "Something went wrong. Please check and try again.",
        duration: 3000,
        closeButton: false,
      });

    } finally {
      setIsSaving(false);
    }
  };

  const handleAttributeClick = (placeholder: Placeholder) => {
    setSelectedPlaceholder(placeholder);

    const existingConfig = attributeConfig[placeholder.id];

    if (!existingConfig) {
      setRequired(false);
      setHidden(false);
      setDefaultValue("");
      setConfigModalOpen(true);
    } else {
      setOverridePromptOpen(true);
    }
  }

  const openConfigModalDirectly = (placeholder: Placeholder) => {
    setSelectedPlaceholder(placeholder);
    setIsEditMode(true);

    const existingConfig = attributeConfig[placeholder.id];
    setRequired(existingConfig?.required ?? false);
    setHidden(existingConfig?.hidden ?? false);
    setDefaultValue(existingConfig?.defaultValue ?? "");

    setConfigModalOpen(true);
  };

  const insertAttributeWithConfig = (config: { required: boolean; hidden: boolean; defaultValue: string | null }) => {
    if (!editor || !selectedPlaceholder) return;

    editor.chain().focus().insertAttributeField({
      label: selectedPlaceholder.label,
      fieldKey: selectedPlaceholder.id,
      required: config.required,
      hidden: config.hidden,
      defaultValue: config.defaultValue,
    }).run();

    // Increment count for this attribute
    setAttributeCounts((prev) => ({
      ...prev,
      [selectedPlaceholder.id]: (prev[selectedPlaceholder.id] || 0) + 1,
    }));
  }

  const saveConfig = () => {
    if (!selectedPlaceholder) return;

    const newConfig = {
      required,
      hidden,
      defaultValue: defaultValue.trim() === "" ? null : defaultValue.trim(),
    }

    setAttributeConfig((prev) => ({
      ...prev,
      [selectedPlaceholder.id]: newConfig,
    }));

    updateAllFieldsOfType(selectedPlaceholder.id, newConfig);
    if (!isEditMode) {
      insertAttributeWithConfig(newConfig);
    }

    setIsEditMode(false);
    setConfigModalOpen(false);
  }

  const openAttributeConfigForOverride = () => {
    if (!selectedPlaceholder) return;

    const existingConfig = attributeConfig[selectedPlaceholder.id];
    setRequired(existingConfig.required);
    setHidden(existingConfig.hidden);
    setDefaultValue(existingConfig.defaultValue || "");
    setOverridePromptOpen(false);
    setConfigModalOpen(true);
  }

  const updateAllFieldsOfType = (fieldKey: string, newConfig: { required: boolean; hidden: boolean; defaultValue: string | null }) => {
    if (!editor) return;

    const { tr } = editor.state;
    let modified = false;

    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === "attributeField" && node.attrs.fieldKey === fieldKey) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          required: newConfig.required,
          hidden: newConfig.hidden,
          defaultValue: newConfig.defaultValue,
        });
        modified = true;
      }
    });

    if (modified) {
      editor.view.dispatch(tr);
    }
  };

  const removeAllFieldsOfType = (fieldKey: string) => {
    if (!editor) return;

    const { tr } = editor.state;
    const positionsToDelete: { pos: number; size: number }[] = [];

    // Collect all positions first
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === "attributeField" && node.attrs.fieldKey === fieldKey) {
        positionsToDelete.push({ pos, size: node.nodeSize });
      }
    });

    // Delete in reverse order to avoid position shifts
    positionsToDelete.reverse().forEach(({ pos, size }) => {
      tr.delete(pos, pos + size);
    });

    if (positionsToDelete.length > 0) {
      editor.view.dispatch(tr);
      // Recalculate counts and clean stale config
      recalculateFieldCounts();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Editor */}
      <div className="flex-[3] p-8 overflow-auto">
        <Editor
          onEditorReady={setEditor}
        />
      </div>

      {/* Right Sidebar – Builder Panel */}
      <div className="flex-[1] bg-white border-l shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{mode.charAt(0).toUpperCase() + mode.slice(1)} Builder Panel</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure fields and content for your {mode}.
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            onClick={() => {
              setCloseDialogOpen(true);
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Accordion type="single" collapsible defaultValue="info" className="w-full">

            {/* Basic Information */}
            <AccordionItem value="info">
              <AccordionTrigger className="px-6 text-base font-medium">
                Basic Information
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`e.g. ${mode === 'template' ? 'Employment Agreement' : 'Confidentiality Clause'}`}
                    className={`
          text-base transition-all duration-200
          ${initialData?.id
                        ? "bg-gray-50 cursor-not-allowed"
                        : "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
                      }
        `}
                    disabled={!!initialData?.id}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    maxLength={150}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) {
                        setDescription(e.target.value);
                      }
                    }}
                    placeholder="Brief description of this content. You can include usage notes, version info, or context."
                    className="resize-none border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all duration-200"
                  />
                  <div className="text-right text-xs text-gray-500">
                    {description.length}/150
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {/* Placeholders / Attributes */}
            <AccordionItem value="placeholders">
              <AccordionTrigger className="px-6 text-base font-medium">
                Attributes
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-4">
                <div className="space-y-2">
                  {attributes.map((attr) => {
                    const count = attributeCounts[attr.id.toString()] || 0;
                    const isActive = count > 0;

                    return (
                      <div key={attr.id} className="group relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`
          w-full justify-between text-left font-normal transition-all duration-200 pr-10
          ${isActive ? "border-indigo-500 bg-indigo-50/50 shadow-sm" : "border-gray-300"}
          hover:bg-indigo-100/70 hover:border-indigo-600 hover:shadow-md hover:-translate-y-px
          active:translate-y-0
        `}
                          onClick={() => handleAttributeClick({
                            id: attr.id.toString(),
                            label: attr.name,
                          })}
                          disabled={!editor}
                        >
                          <span className="truncate pr-2">{attr.name}</span>
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <Badge
                                variant="secondary"
                                className="text-xs shadow-sm ring-1 ring-indigo-300/50 bg-indigo-100 text-indigo-800"
                              >
                                {count}
                              </Badge>
                            )}
                          </div>
                        </Button>
                        {isActive && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md hover:bg-indigo-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <EllipsisVertical className="h-4 w-4 text-indigo-600" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfigModalDirectly({
                                    id: attr.id.toString(),
                                    label: attr.name,
                                  });
                                }}
                              >
                                Update Config
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlaceholder({
                                    id: attr.id.toString(),
                                    label: attr.name,
                                  });
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                Delete All Instances
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reusable Snippets */}
            {mode === 'template' && (
              <AccordionItem value="snippets">
                <AccordionTrigger className="px-6 text-base font-medium">
                  Reusable Snippets
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-4 pb-6">
                  <p className="text-sm text-gray-500 italic text-center">
                    Standard clauses, terms, and sections coming soon
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Rules */}
            {mode === 'template' && (
              <AccordionItem value="rules">
                <AccordionTrigger className="px-6 text-base font-medium">
                  Conditional Rules
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-4 pb-6">
                  <Button
                    variant="outline"
                    className="w-full mb-4 border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => {
                      setEditingRule(null);
                      setRuleDialogOpen(true);
                    }}
                    disabled={!editor || Object.keys(attributeCounts).length === 0}
                  >
                    + Add Conditional Rule
                  </Button>
                  <div className="mt-2 space-y-2">
                    {rules.length === 0 ? (
                      <div className="flex items-center justify-center py-2">
                        <p className="text-sm text-gray-500 italic">No conditional rules yet</p>
                      </div>
                    ) : (
                      rules.map((r) => (
                        <div
                          key={r.id ?? String(r.pos)}
                          className="flex items-center justify-between p-2 rounded-md border border-gray-100 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-xs">
                              {r.action === 'show' ? (
                                <div className="p-1 rounded bg-emerald-50" title="Show">
                                  <Eye className="h-4 w-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="p-1 rounded bg-red-50" title="Hide">
                                  <EyeOff className="h-4 w-4 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-normal text-gray-700">{r.name || (r.condition ? 'Rule' : 'Unnamed')}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRule({ id: r.id, pos: r.pos, condition: r.condition, action: r.action, name: r.name });
                                setRuleDialogOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Fixed Footer with Save Button */}
        <div className="p-6 border-t flex-shrink-0">
          <Button
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 text-white font-medium shadow-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {
              isSaving ? (
                <div className="flex items-center gap-4">
                  <Spinner data-icon="inline-start" />
                  Saving...
                </div>
              ) : (
                `Save ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
              )
            }
          </Button>
        </div>
      </div>
      <Dialog open={overridePromptOpen} onOpenChange={setOverridePromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPlaceholder?.label} Already Configured</DialogTitle>
            <DialogDescription>
              This field type has existing settings. Do you want to use them or override?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">• Required:</span>
              {attributeConfig[selectedPlaceholder?.id ?? ""]?.required ? "Yes" : "No"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">• Hidden:</span>
              {attributeConfig[selectedPlaceholder?.id ?? ""]?.hidden ? "Yes" : "No"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">• Default value:</span>
              {attributeConfig[selectedPlaceholder?.id ?? ""]?.defaultValue || "None"}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const config = attributeConfig[selectedPlaceholder!.id];
                insertAttributeWithConfig(config);
                setOverridePromptOpen(false);
              }}
            >
              Use Existing
            </Button>
            <Button onClick={openAttributeConfigForOverride} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Override Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Configuration Dialog */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Field: {selectedPlaceholder?.label}</DialogTitle>
            <DialogDescription>
              These settings will apply to all instances of this field in the template.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={required}
                onCheckedChange={(checked) => setRequired(!!checked)}
              />
              <Label htmlFor="required" className="font-normal">
                Required field
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hidden"
                checked={hidden}
                onCheckedChange={(checked) => setHidden(!!checked)}
              />
              <Label htmlFor="hidden" className="font-normal">
                Hidden attribute (metadata only - not visible in editor)
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="defaultValue">Default value (optional)</Label>
              <Input
                id="defaultValue"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="e.g. Acme Corporation"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfigModalOpen(false);
                setIsEditMode(false);
              }}>
              Cancel
            </Button>
            <Button onClick={saveConfig} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isEditMode ? "Update All Fields" : "Insert Attribute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete All {selectedPlaceholder?.label} Fields?</DialogTitle>
            <DialogDescription>
              This will permanently remove all instances of this field from the template. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeAllFieldsOfType(selectedPlaceholder!.id);
                setDeleteConfirmOpen(false);
              }}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in this template. Closing now will discard them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setCloseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCloseDialogOpen(false);
                navigate('/templates');
              }}
            >
              Discard & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DynamicDialog
        open={ruleDialogOpen}
        title={editingRule ? "Edit Conditional Rule" : "Add Conditional Rule"}
        description="Control when this section of the template appears or is hidden."
        fields={getRuleDialogFields()}
        initialValues={
          editingRule?.condition && editingRule.action
            ? {
              name: editingRule.name ?? '',
              conditions: editingRule.condition,
              action: editingRule.action,
            }
            : {}
        }
        submitButtonText={editingRule ? "Update Rule" : "Add Rule"}
        cancelButtonText="Cancel"
        onUpdate={(values: Record<string, any>) => {
          const { name, conditions, action } = values;

          if (!name || String(name).trim() === "") {
            toast.error("Rule name is required");
            return;
          }

          if (!conditions || !Array.isArray(conditions.items) || conditions.items.length === 0 || !action) {
            toast.error("Please fill all required fields");
            return;
          }

          const conditionGroup = {
            join: conditions.join ?? 'and',
            items: conditions.items.map((it: any) => ({ fieldKey: it.fieldKey, operator: it.operator, value: String(it.value) }))
          };

          // Determine whether to wrap selection or insert new block
          const hasSelection = editor && !editor.state.selection.empty;

          if (editingRule && editingRule.id) {
            // Update the existing conditional block node at the saved position
            const idToFind = editingRule.id;
            if (!idToFind) {
              toast.error("Failed to update rule: missing id");
            } else if (editor) {
              // Prefer locating node by id (more robust than stored pos)
              let foundPos: number | null = null;
              editor.state.doc.descendants((node: any, pos: number) => {
                if (node.type && node.type.name === 'conditionalBlock' && node.attrs && node.attrs.id === idToFind) {
                  foundPos = pos;
                  return false; // stop iteration
                }
                return true;
              });

              if (foundPos === null) {
                toast.error('Failed to update rule: block not found in document');
              } else {
                try {
                  const node = editor.state.doc.nodeAt(foundPos);
                  if (!node) throw new Error('node missing at foundPos');
                  const schema = editor.schema;
                  const newAttrs = { ...(node.attrs || {}), condition: conditionGroup, action, name };
                  const newNode = schema.nodes.conditionalBlock.create(newAttrs, node.content);
                  let tr2 = editor.state.tr.replaceWith(foundPos, foundPos + node.nodeSize, newNode);
                  tr2 = tr2.setSelection(TextSelection.create(tr2.doc, foundPos + 1));
                  editor.view.dispatch(tr2);
                  toast.success('Rule updated');
                } catch (err: any) {
                  toast.error('Failed to update rule: ' + (err?.message || String(err)));
                }
              }
            }
          } else if (hasSelection) {
            // Wrap the current selection
            editor.chain().focus().wrapInConditionalBlock({
              condition: conditionGroup,
              action: action as "show" | "hide",
              name: name,
            } as any).run();
            toast.success("Conditional rule applied to selected content");
          } else {
            // No selection - insert new block
            editor.chain().focus().insertConditionalBlock({
              condition: conditionGroup,
              action: action as "show" | "hide",
              name: name,
            } as any).run();
            toast.success("New conditional block added");
          }

          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
        onCancel={() => {
          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
      />
    </div>
  );
}