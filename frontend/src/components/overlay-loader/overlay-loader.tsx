import { Spinner } from "@/components/ui/spinner";
import type { OverlayLoaderProps } from "../../types/index";

export function OverlayLoader({ show, message = "Loading..." }: OverlayLoaderProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Spinner className="size-8" />
        <span className="text-lg font-medium">{message}</span>
      </div>
    </div>
  );
}
