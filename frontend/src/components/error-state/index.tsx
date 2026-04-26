import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { ErrorStateProps } from "@/types";

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load the content. Please try again later.",
  onRetry,
  onHome,
  homeLabel = "Home",
  retryLabel = "Try Again",
}: ErrorStateProps) {
  return (
    <Empty className="w-full py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription className="max-w-md mx-auto">
          {description}
        </EmptyDescription>
      </EmptyHeader>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {onHome && (
          <Button variant="outline" onClick={onHome}>
            {homeLabel}
          </Button>
        )}
      </div>
    </Empty>
  )
}