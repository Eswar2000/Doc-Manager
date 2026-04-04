from src.model.templates import TemplateAttribute
import re
import html

def validate_attribute_values(values: dict, attributes: list[TemplateAttribute]) -> tuple[dict, list[dict]]:
    resolved: dict = {}
    missing: list[dict] = []

    for a in attributes or []:
        label = a.label
        attribute_id = a.attributeId

        # Prefer value by label, then by attribute id
        if label is not None and label in values:
            val = values[label]
        elif attribute_id is not None and (str(attribute_id) in values or attribute_id in values):
            # Accept both string and non-string keys
            val = values.get(str(attribute_id), values.get(attribute_id))
        else:
            val = a.defaultValue
        # Empty-string should be considered a provided value (not missing)
        has_value = val is not None and not (isinstance(val, str) and val == "")

        if a.required and not has_value:
            missing.append({"label": label, "attributeId": attribute_id})

        key = label if label else str(attribute_id)
        resolved[key] = "" if val is None else val

    return resolved, missing

def render_html_from_template(html_content: str, resolved: dict) -> str:
    """Render `html_content` by replacing placeholders like `{{ Label }}`
    with values from `resolved`.

    - Escapes values with `html.escape` to avoid injection.
    - Leaves placeholders untouched when the key is missing in `resolved`.
    """
    if not html_content:
        return ""

    pattern = re.compile(r"\{\{\s*(.+?)\s*\}\}")

    def _repl(match):
        key = match.group(1).strip()
        if key in resolved:
            return html.escape(str(resolved.get(key, "")))
        # keep original placeholder when no value provided
        return match.group(0)

    return pattern.sub(_repl, html_content)
