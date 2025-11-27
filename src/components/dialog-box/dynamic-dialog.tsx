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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
                            {(field.type === "text") && (
                                <Input
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
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
                                <Textarea
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="min-h-[100px]"
                                />
                            )}

                            {/* Select */}
                            {field.type === "select" && (
                                <Select
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onValueChange={(value) => handleChange(field.name, value)}
                                >
                                    <SelectTrigger
                                        className={`w-full ${field.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                    >
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {field.options?.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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