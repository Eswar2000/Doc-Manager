import React from "react";
import { v4 as uuidv4 } from "uuid";
import TemplateEditor from "../editor/editor";
import type { Placeholder } from "../../types/table-types";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const placeholders: Placeholder[] = [
  { id: "1", label: "Client Name" },
  { id: "2", label: "Contract Date" },
  { id: "3", label: "Total Amount" },
  { id: "4", label: "Signature" },
  { id: "5", label: "Company Name" },
  { id: "6", label: "Effective Date" },
  { id: "7", label: "Recipient Email" },
  { id: "8", label: "Document Title" },
];

export default function TemplateEditPage() {
  const [editor, setEditor] = React.useState<any>(null);
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
  const [selectedPlaceholder, setSelectedPlaceholder] = React.useState<Placeholder | null>(null);

  const [required, setRequired] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [defaultValue, setDefaultValue] = React.useState("");

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

  // Safe real-time sync on every document change
  React.useEffect(() => {
    if (editor) {
      recalculateFieldCounts(); // Initial count

      const handler = ({ transaction }: { transaction: any }) => {
        if (transaction.docChanged) {
          // Queue to next tick — prevents infinite update loops
          setTimeout(recalculateFieldCounts, 0);
        }
      };

      editor.on("transaction", handler);

      return () => {
        editor.off("transaction", handler);
      };
    }
  }, [editor]);

  const handleSaveTemplate = () => {
    if (!editor) return;

    const templateId = uuidv4();
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
        defaultValue: string | null;
      }>();

    // First, build a map from label -> original id (from placeholders)
    const labelToId = new Map<string, string>();
    placeholders.forEach(p => {
      labelToId.set(p.label, p.id);
    });

    // Traverse document to collect trackerIds per label
    editor.state.doc.descendants((node: any) => {
      if (node.type.name === "attributeField") {
        const { label, trackerId, fieldKey } = node.attrs as {
          label: string;
          trackerId: string;
          fieldKey: string | null;
        };

        if (label && trackerId && fieldKey) {
          const attributeId = labelToId.get(label) || "custom";

          // Get config from our React state
          const config = attributeConfig[fieldKey] || {
            required: false,
            hidden: false,
            defaultValue: null,
          };

          if (!attributeMap.has(label)) {
            attributeMap.set(label, {
              attributeId,
              label,
              required: config.required,
              hidden: config.hidden,
              defaultValue: config.defaultValue,
              trackerIds: [],
            });
          }

          attributeMap.get(label)!.trackerIds.push(trackerId);
        }
      }
    });

    const attributes = Array.from(attributeMap.values());

    const templateData = {
      templateId,
      html,
      json,
      attributes,
    };

    console.log("Saved Template:", JSON.stringify(templateData, null, 2));
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

  const saveConfigAndInsert = () => {
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

    insertAttributeWithConfig(newConfig);
    updateAllFieldsOfType(selectedPlaceholder.id, newConfig);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Editor */}
      <div className="flex-[3] p-8 overflow-auto">
        <TemplateEditor
          initialContent="<p>Start writing your contract...</p>"
          onEditorReady={setEditor}
        />
      </div>

      {/* Right Sidebar – Field Library */}
      <div className="flex-[1] bg-white border-l shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Field Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click a field to insert at cursor
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Accordion type="single" collapsible defaultValue="placeholders" className="w-full">
            {/* Placeholders / Attributes */}
            <AccordionItem value="placeholders">
              <AccordionTrigger className="px-6 text-base font-medium">
                Attributes
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-4">
                <div className="space-y-2">
                  {placeholders.map((placeholder) => {
                    const count = attributeCounts[placeholder.id] || 0;
                    const isActive = count > 0;

                    return (
                      <Button
                        key={placeholder.id}
                        variant="outline"
                        size="sm"
                        className={`
        w-full justify-between text-left font-normal transition-all duration-200 relative overflow-hidden
        ${isActive
                            ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                            : "border-gray-300"
                          }
        hover:bg-indigo-100/70 hover:border-indigo-600 hover:shadow-md hover:-translate-y-px
        active:translate-y-0
      `}
                        onClick={() => handleAttributeClick(placeholder)}
                        disabled={!editor}
                      >
                        <span className="truncate pr-2">{placeholder.label}</span>
                        {isActive && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs shadow-sm ring-1 ring-indigo-300/50 bg-indigo-100 text-indigo-800"
                          >
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reusable Snippets */}
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

            {/* Rules */}
            <AccordionItem value="rules">
              <AccordionTrigger className="px-6 text-base font-medium">
                Conditional Rules
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-4 pb-6">
                <p className="text-sm text-gray-500 italic text-center">
                  Show/hide logic and dynamic content coming soon
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Fixed Footer with Save Button */}
        <div className="p-6 border-t flex-shrink-0">
          <Button
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 text-white font-medium shadow-sm"
            onClick={handleSaveTemplate}
          >
            Save Template
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
                Hidden attribute (metadata only – not visible in editor)
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
            <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveConfigAndInsert} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Insert Attribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}