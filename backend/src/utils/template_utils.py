from src.model.templates import TemplateAttribute

def replace_attribute_fields(node, defaults: dict | None = None):
    if not isinstance(node, dict):
        return
    content = node.get("content")
    if isinstance(content, list):
        i = 0
        while i < len(content):
            child = content[i]
            if isinstance(child, dict) and child.get("type") == "attributeField":
                attrs = child.get("attrs", {}) or {}
                label = attrs.get("label") or ""

                if defaults is not None and label in defaults:
                    value = defaults.get(label)
                    replacement_text = "" if value is None else str(value)
                else:
                    replacement_text = f"{{{{ {label} }}}}" if label else ""

                # Replace the attributeField node with a text node
                content[i] = {"type": "text", "text": replacement_text}

                # If the next sibling is a text node (often blank), remove it
                next_idx = i + 1
                if next_idx < len(content):
                    nxt = content[next_idx]
                    if isinstance(nxt, dict) and nxt.get("type") == "text":
                        del content[next_idx]

                i += 1
                continue

            replace_attribute_fields(child, defaults)
            i += 1


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
