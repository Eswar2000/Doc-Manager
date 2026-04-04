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


def normalize_marks(node):
    """Traverse the ProseMirror JSON and normalize/remove marks so the
    server-side `prosemirror` basic schema can parse it.

    Conversions applied:
    - `bold` -> `strong`
    - `italic` -> `em`
    - `fontSize` -> removed (font-size handled client-side)
    - `textStyle` -> removed (font-family handled client-side)
    - `underline` -> removed

    The function mutates the input `node` in-place.
    """
    if not isinstance(node, dict):
        return

    # Normalize marks on this node if present
    marks = node.get("marks")
    if isinstance(marks, list):
        new_marks = []
        for m in marks:
            if not isinstance(m, dict):
                continue
            mtype = m.get("type")
            # map client mark names to prosemirror basic schema names
            if mtype == "bold":
                new_marks.append({"type": "strong"})
            elif mtype == "italic":
                new_marks.append({"type": "em"})
            # drop marks that basic schema doesn't support or that are styling-only
            elif mtype in ("fontSize", "textStyle", "underline", "textStyle"):
                # skip
                continue
            else:
                # Preserve any marks that already look compatible
                new_marks.append(m)

        if new_marks:
            node["marks"] = new_marks
        else:
            node.pop("marks", None)

    # Recurse into children
    content = node.get("content")
    if isinstance(content, list):
        for child in content:
            normalize_marks(child)


def normalize_node_types(node):
    """Normalize node `type` values from client-style camelCase to
    ProseMirror basic schema snake_case equivalents so `Node.from_json`
    can parse them.

    Example mappings:
    - `hardBreak` -> `hard_break`
    - `bulletList` -> `bullet_list`
    - `orderedList` -> `ordered_list`
    - `listItem` -> `list_item`
    - `tableRow` -> `table_row`
    - `tableCell` -> `table_cell`
    - `tableHeader` -> `table_header`

    The function mutates the input `node` in-place.
    """
    if not isinstance(node, dict):
        return

    mapping = {
        "hardBreak": "hard_break",
        "bulletList": "bullet_list",
        "orderedList": "ordered_list",
        "listItem": "list_item",
        "tableRow": "table_row",
        "tableCell": "table_cell",
        "tableHeader": "table_header",
        # attributeField should already be replaced by replace_attribute_fields,
        # but map it to a text node if it slips through.
        "attributeField": "text",
    }

    t = node.get("type")
    if isinstance(t, str) and t in mapping:
        node["type"] = mapping[t]

    # Recurse into children
    content = node.get("content")
    if isinstance(content, list):
        for child in content:
            normalize_node_types(child)


def sanitize_node_types(node, schema):
    """Replace unknown node types (w.r.t. provided `schema`) with safe
    equivalents so `Node.from_json` won't raise Unknown node type errors.

    - If a node's `type` exists in `schema.nodes`, keep it.
    - Else, try a small camelCase -> snake_case mapping.
    - Else, if the node has `text`, convert it to a `text` node preserving the text.
    - Else, replace with an empty `paragraph` node.

    The function mutates `node` in-place and requires the `schema` object
    from `prosemirror.schema.basic`.
    """
    if not isinstance(node, dict):
        return

    mapping = {
        "hardBreak": "hard_break",
        "bulletList": "bullet_list",
        "orderedList": "ordered_list",
        "listItem": "list_item",
        "tableRow": "table_row",
        "tableCell": "table_cell",
        "tableHeader": "table_header",
    }

    t = node.get("type")
    if isinstance(t, str):
        if t not in schema.nodes:
            mapped = mapping.get(t)
            if mapped and mapped in schema.nodes:
                node["type"] = mapped
            else:
                # Fallback replacements
                if "text" in node:
                    # convert to a plain text node
                    text_val = node.get("text")
                    node.clear()
                    node.update({"type": "text", "text": text_val})
                else:
                    # replace with an empty paragraph
                    node.clear()
                    node.update({"type": "paragraph", "content": []})

    # Recurse into children
    content = node.get("content")
    if isinstance(content, list):
        for child in content:
            sanitize_node_types(child, schema)
