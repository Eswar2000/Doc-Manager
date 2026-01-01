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
import { Button } from "@/components/ui/button";

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
                      onClick={() => {
                        if (editor) {
                          editor.commands.insertAttributeField(placeholder.label);
                        }
                      }}
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
    </div>
  );
}