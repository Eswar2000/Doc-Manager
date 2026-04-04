def replace_attribute_fields(node):
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
                placeholder = f"{{{{ {label} }}}}" if label else ""

                # Replace the attributeField node with a text node
                content[i] = {"type": "text", "text": placeholder}

                # If the next sibling is a text node (always blank), remove it
                next_idx = i + 1
                if next_idx < len(content):
                    nxt = content[next_idx]
                    if isinstance(nxt, dict) and nxt.get("type") == "text":
                        del content[next_idx]

                i += 1
                continue

            replace_attribute_fields(child)
            i += 1
