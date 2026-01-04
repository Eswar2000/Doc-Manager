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
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [overridePromptOpen, setOverridePromptOpen] = React.useState(false);
  const [selectedPlaceholder, setSelectedPlaceholder] = React.useState<Placeholder | null>(null);

  const [required, setRequired] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [defaultValue, setDefaultValue] = React.useState("");

  const handleSaveTemplate = () => {
    if (!editor) return;

    const templateId = uuidv4();
    const html = editor.getHTML();
    const json = editor.getJSON();

    // Map to collect trackerIds per label
    const attributeMap = new Map<string, { attributeId: string; trackerIds: string[] }>();

    // First, build a map from label → original id (from placeholders)
    const labelToId = new Map<string, string>();
    placeholders.forEach(p => {
      labelToId.set(p.label, p.id);
    });

    // Traverse document to collect trackerIds per label
    editor.state.doc.descendants((node: any) => {
      if (node.type.name === "attributeField") {
        const { label, trackerId } = node.attrs as { label: string; trackerId: string };
        if (label && trackerId) {
          const attributeId = labelToId.get(label) || "unknown"; // fallback if label not in placeholders

          if (!attributeMap.has(label)) {
            attributeMap.set(label, {
              attributeId,
              trackerIds: [],
            });
          }
          attributeMap.get(label)!.trackerIds.push(trackerId);
        }
      }
    });

    // Convert map to array
    const attributes = Array.from(attributeMap.entries()).map(([attributName, data]) => ({
      attributeId: data.attributeId,
      attributName,
      trackerIds: data.trackerIds,
    }));

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
                  {placeholders.map((placeholder) => (
                    <Button
                      key={placeholder.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => handleAttributeClick(placeholder)}
                      disabled={!editor}
                    >
                      {placeholder.label}
                    </Button>
                  ))}
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
            <Button onClick={openAttributeConfigForOverride}>
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
            <Button onClick={saveConfigAndInsert}>
              Insert Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}