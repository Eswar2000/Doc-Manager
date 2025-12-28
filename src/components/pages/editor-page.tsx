import TemplateEditor from "../editor/editor";
import type { Placeholder } from "../../types/table-types";

const placeholders: Placeholder[] = [
  { id: "1", label: "Client Name" },
  { id: "2", label: "Contract Date" },
  { id: "3", label: "Total Amount" },
  { id: "4", label: "Signature" },
];

export default function TemplateEditPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Your left sidebar can go here */}

      <div className="flex-1 p-8 overflow-auto">
        <TemplateEditor
          initialContent="<p>Start writing your contract...</p>"
          onChange={(html) => console.log("→ HTML:", html)}
        />
      </div>

      {/* Right sidebar – placeholders */}
      <div className="w-80 bg-white border-l p-6 overflow-y-auto">
      </div>
    </div>
  );
}