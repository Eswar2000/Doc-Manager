import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DynamicDialogProps } from "@/types/table-types";

export default function DynamicDialog({
    open,
    title,
    description,
    fields,
    initialValues = {},
    submitButtonText = "Submit",
    cancelButtonText = "Cancel",
    onUpdate,
    onCancel
}: DynamicDialogProps) {
    const [formValues, setFormValues] = useState(initialValues);

    const handleChange = (name: string, value: any) => {
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }

    const handleSubmit = () => {
        onUpdate(formValues);
    }

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                {/* Dynamic Form */}
                <div className="space-y-4 mt-4">
                    {fields.map((field) => (
                        <div key={field.name} className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">{field.label}</label>

                            {/* Text Input */}
                            {field.type === "text" && (
                                <input
                                    type="text"
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className={`border rounded-md px-3 py-2 ${field.disabled
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                        }`}
                                />
                            )}

                            {/* Number Input */}
                            {field.type === "number" && (
                                <input
                                    type="number"
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) =>
                                        handleChange(field.name, Number(e.target.value))
                                    }
                                    className={`border rounded-md px-3 py-2 ${field.disabled
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                        }`}
                                />
                            )}

                            {/* Textarea */}
                            {field.type === "textarea" && (
                                <textarea
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className={`border rounded-md px-3 py-2 h-24 ${field.disabled
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                        }`}
                                />
                            )}

                            {/* Select */}
                            {field.type === "select" && (
                                <select
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className={`border rounded-md px-3 py-2 ${field.disabled
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "bg-white"
                                        }`}
                                >
                                    <option value="">Select...</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}
                </div>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onCancel}>{cancelButtonText}</Button>
                    <Button onClick={handleSubmit}>{submitButtonText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}