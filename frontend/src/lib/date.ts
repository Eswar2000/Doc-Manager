export function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}