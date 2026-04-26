import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { templateApi } from "@/api/templates";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { ErrorState } from "@/components/error-state";
import { OverlayLoader } from "@/components/overlay-loader/overlay-loader";

export default function DocGenerationPage() {
    const { templateId } = useParams<{ templateId: string }>();
    const navigate = useNavigate();

    const [fileName, setFileName] = useState("");
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [openPopover, setOpenPopover] = useState<string | null>(null);

    const { data: template, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['template', templateId],
        queryFn: () => templateApi.fetchTemplateById(templateId!),
        enabled: !!templateId,
    });

    const handleChange = (key: string, value: string) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        if (!template) return;

        const errors: Record<string, string> = {};
        const FILE_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;
        if (!fileName || fileName.trim() === "") {
            errors["fileName"] = "File name is required";
        } else if (!FILE_NAME_REGEX.test(fileName)) {
            errors["fileName"] = "File name contains invalid characters";
        } else if (fileName.length > 50) {
            errors["fileName"] = "File name should not exceed 50 characters";
        }

        template.attributes?.forEach((attr: any) => {
            const value = formValues[attr.attributeId];

            if (attr.required && (!value || value.trim() === "")) {
                errors[attr.attributeId] = `${attr.label} is required`;
            }
        });

        return errors;
    };

    const handleGenerate = async () => {
        if (!templateId) return;

        const errors = validateForm();
        if (errors && Object.keys(errors).length > 0) {
            const MAX_ERRORS_TO_SHOW = 1;

            const errorList = Object.values(errors);
            const visibleErrors = errorList.slice(0, MAX_ERRORS_TO_SHOW);
            const remainingCount = errorList.length - visibleErrors.length;

            toast.error(
                <div className="space-y-2">
                    <div className="font-semibold text-sm text-red-600">
                        Please fix the following validation errors:
                    </div>

                    <ul className="list-disc pl-5 text-sm space-y-1">
                        {visibleErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>

                    {remainingCount > 0 && (
                        <div className="text-xs text-red-100">
                            + {remainingCount} more error{remainingCount > 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            );
            return;
        }

        setIsGenerating(true);
        try {
            const docGenRequest = {
                templateId,
                attributeValues: formValues,
            };
            const response = await templateApi.generateDocument(docGenRequest);

            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName.trim()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Document generated and downloaded successfully!");
            navigate('/templates');
        } catch (err) {
            toast.error("Failed to generate document. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <Loader screenHeader="Loading your template" screenMessage="Please wait till we fetch the template" />;
    if (isError || !template) return <ErrorState title="Failed to load templates" description={error?.message || "We couldn't load the templates right now."} onRetry={() => refetch()} onHome={() => { navigate('/templates') }} />;

    return (
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
            <OverlayLoader
                show={isGenerating}
                message="Generating your document, please wait..."
            />

            {/* Top Bar */}
            <div className="border-b bg-white">
                <div className="mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{template.name}</h1>
                        <p className="text-sm text-gray-500">Fill in the details to generate the document</p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/templates')}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Attributes Form */}
            <div className="w-full px-6 py-10">
                <div className="mb-8 w-[300px]">
                    <Label className="flex items-center gap-2 text-base">
                        File Name <span className="text-red-500">*</span>
                    </Label>

                    <Input
                        placeholder="Enter File Name"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="mt-2 focus-visible:ring-1 transition-colors duration-150 border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                    />

                    <p className="text-xs text-gray-600 mt-1">
                        Only letters, numbers, spaces, hyphens, and underscores allowed
                    </p>
                </div>

                <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,max-content))]">
                    {template.attributes?.map((attr: any) => {
                        const isRequired = attr.required;
                        const isHidden = attr.hidden;

                        return (
                            <div key={attr.attributeId} className="space-y-2">
                                <Label className="flex items-center gap-2 text-base">
                                    {attr.label}
                                    {isRequired && <span className="text-red-500">*</span>}
                                    {isHidden && (
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                            <Info className="h-3.5 w-3.5" /> metadata only
                                        </span>
                                    )}
                                </Label>

                                {attr.type === "date" ? (
                                    <Popover
                                        open={openPopover === attr.attributeId}
                                        onOpenChange={(open) =>
                                            setOpenPopover(open ? attr.attributeId : null)
                                        }>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    "border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-colors duration-150",
                                                    !formValues[attr.attributeId] && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formValues[attr.attributeId]
                                                    ? format(new Date(formValues[attr.attributeId]), "PPP")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2 border border-indigo-300 bg-white shadow-lg rounded-lg">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    formValues[attr.attributeId]
                                                        ? new Date(formValues[attr.attributeId])
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    handleChange(attr.attributeId, format(date, "dd-MM-yyyy"));
                                                    setOpenPopover(null);
                                                }}
                                                classNames={{
                                                    cell: "p-2"
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <Input
                                        type={
                                            attr.type === "email" ? "email" :
                                                attr.type === "number" ? "number" : "text"
                                        }
                                        placeholder={`Enter ${attr.label}`}
                                        value={formValues[attr.attributeId] || ""}
                                        onChange={(e) => handleChange(attr.attributeId, e.target.value)}
                                        required={isRequired}
                                        className="focus-visible:ring-1 transition-colors duration-150 border-indigo-500 bg-indigo-50/50 shadow-sm focus-visible:ring-indigo-500"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="mt-8">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-[#4F39F6] hover:bg-[#3f2be6] px-8"
                    >
                        Generate Document
                    </Button>
                </div>
            </div>
        </div>
    );
}