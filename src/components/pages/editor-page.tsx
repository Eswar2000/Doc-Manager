import React, { useState } from "react";

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Editor */}
      <div className="flex-[3] p-8 overflow-auto">
        <TemplateEditor
          initialContent="<p>Start writing your contract...</p>"
          onChange={(html) => console.log("→ HTML:", html)}
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
            onClick={() => {
              console.log("Save Template clicked");
            }}
          >
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}