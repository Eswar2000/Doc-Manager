import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DynamicDialogProps } from "@/types/index";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Trash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        // Reset the form when dialog opens or the initial values change
        setFormValues(initialValues ?? {});
        setErrors([]);
    }, [open, initialValues]);

    const handleChange = (name: string, value: any) => {
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }

    const handleAddConditionRow = (fieldName: string) => {
        const current = formValues[fieldName] ?? { join: 'and', items: [] };
        const items = Array.isArray(current.items) ? current.items.slice() : [];
        items.push({ fieldKey: '', operator: '', value: '' });
        handleChange(fieldName, { ...current, items });
    }

    const handleRemoveConditionRow = (fieldName: string, idx: number) => {
        const current = formValues[fieldName] ?? { join: 'and', items: [] };
        const items = Array.isArray(current.items) ? current.items.slice() : [];
        items.splice(idx, 1);
        handleChange(fieldName, { ...current, items });
    }

    const handleConditionRowChange = (fieldName: string, idx: number, key: string, value: any) => {
        const current = formValues[fieldName] ?? { join: 'and', items: [] };
        const items = Array.isArray(current.items) ? current.items.slice() : [];
        items[idx] = { ...(items[idx] || {}), [key]: value };
        handleChange(fieldName, { ...current, items });
    }

    const handleSubmit = () => {
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return; // stop submission and report errors
        }

        setErrors([]);
        onUpdate(formValues);
    }

    const validateForm = () => {
        const newErrors: string[] = [];

        fields.forEach((field) => {
            const value = formValues[field.name];

            //Is required validation (simple fields)
            if (field.type !== 'conditions') {
                if (field.required && (value === undefined || value === null || value === "")) {
                    newErrors.push(`${field.label} is required.`);
                }

                // Max length validation for text and textarea
                if ((field.type === "text" || field.type === "textarea") && field.maxLength && value && value.length > field.maxLength) {
                    newErrors.push(`${field.label} must be at most ${field.maxLength} characters.`);
                }

                // Number validations
                if (field.type === "number" && value !== "" && isNaN(Number(value))) {
                    newErrors.push(`${field.label} must be a valid number.`);
                }
            } else {
                // conditions field validation
                const group = value ?? { join: 'and', items: [] };
                const items = Array.isArray(group.items) ? group.items : [];
                if (field.required && items.length === 0) {
                    newErrors.push(`${field.label} requires at least one condition.`);
                }
                items.forEach((it: any, idx: number) => {
                    if (!it.fieldKey) newErrors.push(`${field.label}: condition ${idx + 1} missing Attribute.`);
                    if (!it.operator) newErrors.push(`${field.label}: condition ${idx + 1} missing Operator.`);
                    if (it.value === undefined || it.value === null || String(it.value).trim() === '') newErrors.push(`${field.label}: condition ${idx + 1} missing Value.`);
                });
            }
        });

        return newErrors;
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
                <div className="space-y-4 mt-2">
                    {fields.map((field) => (
                        <div key={field.name} className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</label>

                            {/* Text Input */}
                            {(field.type === "text") && (
                                <Input
                                    disabled={field.disabled}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className={cn(
                                        "focus-visible:ring-1 transition-colors duration-150",
                                        field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                        !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                    )}
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
                                    className={cn(
                                        "min-h-[100px] focus-visible:ring-1 transition-colors duration-150",
                                        field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                        !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                    )}
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
                                        className={cn(
                                            "w-full focus-visible:ring-1 transition-colors duration-150",
                                            field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                            !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                        )}
                                    >
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>

                                    <SelectContent className="border-indigo-500 shadow-sm focus-visible:ring-indigo-500">
                                        {field.options?.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Conditions group */}
                            {field.type === "conditions" && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm">Match</label>
                                        <Select
                                            disabled={field.disabled}
                                            value={(formValues[field.name]?.join) ?? 'and'}
                                            onValueChange={(val) => handleChange(field.name, { ...(formValues[field.name] ?? { items: [] }), join: val })}
                                        >
                                            <SelectTrigger className={cn(
                                                "w-36 focus-visible:ring-1 transition-colors duration-150",
                                                field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                                !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                            )}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="and">All</SelectItem>
                                                <SelectItem value="or">Any</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {(formValues[field.name]?.items ?? []).map((row: any, idx: number) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-4">
                                                <Select
                                                    disabled={field.disabled}
                                                    value={row.fieldKey ?? ''}
                                                    onValueChange={(val) => handleConditionRowChange(field.name, idx, 'fieldKey', val)}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "w-full focus-visible:ring-1 transition-colors duration-150",
                                                        field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                                        !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                                    )}>
                                                        <SelectValue placeholder="Attribute" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(field.options ?? []).map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-3">
                                                <Select
                                                    disabled={field.disabled}
                                                    value={row.operator ?? ''}
                                                    onValueChange={(val) => handleConditionRowChange(field.name, idx, 'operator', val)}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "w-full focus-visible:ring-1 transition-colors duration-150",
                                                        field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                                        !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                                    )}>
                                                        <SelectValue placeholder="Operator" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(field.operatorOptions ?? ['equals', 'not_equals', 'greater', 'less']).map((op) => (
                                                            <SelectItem key={op} value={op}>{op.replace('_', ' ')}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-3">
                                                <Input
                                                    disabled={field.disabled}
                                                    value={row.value ?? ''}
                                                    onChange={(e) => handleConditionRowChange(field.name, idx, 'value', e.target.value)}
                                                    placeholder="Value"
                                                    className={cn(
                                                        "focus-visible:ring-1 transition-colors duration-150",
                                                        field.disabled && "border-black-800 bg-gray-100 cursor-not-allowed",
                                                        !field.disabled && "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2 flex">
                                                <Button variant="ghost" onClick={() => handleRemoveConditionRow(field.name, idx)} className="text-indigo-600 hover:text-indigo-700">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div>
                                        <Button onClick={() => handleAddConditionRow(field.name)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                            <Plus className="h-4 w-4" /> Add condition
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {errors.length > 0 && (
                    <Alert
                        variant="destructive"
                        className="w-full border border-red-500"
                    >
                        <AlertCircleIcon />
                        <AlertTitle>Validation Error(s)</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc ml-6 space-y-1">
                                {errors.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onCancel}>{cancelButtonText}</Button>
                    <Button onClick={handleSubmit}>{submitButtonText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}