export function formatLabel(value: string): string {
  if (!value) return "";

  return value
    // convert camelCase → camel Case
    .replace(/([a-z])([A-Z])/g, "$1 $2")

    // convert snake_case / kebab-case → spaces
    .replace(/[_-]+/g, " ")

    // lowercase everything first (normalize)
    .toLowerCase()

    // capitalize each word
    .replace(/\b\w/g, (char) => char.toUpperCase());
}