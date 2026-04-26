import { Spinner } from "@/components/ui/spinner";
import type { OverlayLoaderProps } from "@/types";

export function OverlayLoader({ show, message = "Loading..." }: OverlayLoaderProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-8 py-5 
                            flex items-center gap-3 border border-gray-100">
        <Spinner className="size-7 text-indigo-600" />
        <span className="text-[15px] font-medium text-gray-600">
          {message}
        </span>
      </div>
    </div>
  );
}
