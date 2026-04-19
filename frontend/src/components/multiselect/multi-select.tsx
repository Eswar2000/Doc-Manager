import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  disabled,
}: MultiSelectProps) {
  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            "border-indigo-500 bg-indigo-50/50",
            "hover:bg-indigo-50",
            "focus-visible:ring-indigo-500"
          )}
        >
          <div className="flex gap-1 flex-wrap">
            {value.length === 0 && (
              <span className="text-muted-foreground">Select...</span>
            )}

            {value.slice(0, 3).map((val) => (
              <Badge key={val} variant="secondary" className="text-xs">
                {val.replace(/_/g, " ")}
              </Badge>
            ))}

            {value.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>

          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-2">
        <div className="space-y-1">
          {options.map((opt) => {
            const isSelected = value.includes(opt);

            return (
              <div
                key={opt}
                onClick={() => toggleValue(opt)}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm",
                  "hover:bg-indigo-50",
                  isSelected && "bg-indigo-100"
                )}
              >
                <span>{opt.replace(/_/g, " ")}</span>

                {isSelected && (
                  <Check className="h-4 w-4 text-indigo-600" />
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}