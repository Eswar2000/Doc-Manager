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
import { Loader } from "../loader/loader";
import { ErrorState } from "../error-state/error-state";
import { OverlayLoader } from "../overlay-loader/overlay-loader";

export default function DocGenerationPage() {
    const { templateId } = useParams<{ templateId: string }>();
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: template, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['template', templateId],
        queryFn: () => templateApi.fetchTemplateById(templateId!),
        enabled: !!templateId,
    });

    const handleChange = (key: string, value: string) => {
        setFormValues(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerate = async () => {
        if (!templateId) return;

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
            link.download = `${template?.name || "document"}.pdf`;
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
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formValues[attr.attributeId] && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formValues[attr.attributeId]
                                                    ? format(new Date(formValues[attr.attributeId]), "PPP")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formValues[attr.attributeId] ? new Date(formValues[attr.attributeId]) : undefined}
                                                onSelect={(date) => handleChange(attr.attributeId, date?.toISOString() || "")}
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
                                        className="h-11"
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
                        {isGenerating ? "Generating PDF..." : "Generate Document"}
                    </Button>
                </div>
            </div>
        </div>
    );
}