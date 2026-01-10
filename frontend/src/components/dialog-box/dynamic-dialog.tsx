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
import type { DynamicDialogProps } from "@/types/index";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

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

    const handleChange = (name: string, value: any) => {
        setFormValues((prev) => ({ ...prev, [name]: value }));
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

            //Is required validation
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