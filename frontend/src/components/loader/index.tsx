import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { LoaderProps } from "../../types/index";
import { Spinner } from "@/components/ui/spinner"

export function Loader({screenHeader, screenMessage}: LoaderProps) {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>{screenHeader}</EmptyTitle>
        <EmptyDescription>
          {screenMessage}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
