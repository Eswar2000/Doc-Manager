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
    if (isError) return <ErrorState title="Failed to load templates" description={error?.message || "We couldn't load the templates right now."} onRetry={() => refetch()} onHome={() => { navigate('/templates') }} />;

    return (
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
            {/* Top Bar */}
            <div className="border-b bg-white">
                <div className="mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{template?.name}</h1>
                        <p className="text-sm text-gray-500">Fill in the details to generate the document</p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/templates')}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}