from src.model.attributes import AttributeType
from src.model.templates import TemplateAttribute, TemplateRule, TemplateRuleCondition, TemplateRuleConditionItem
import re
import html
import datetime
from bs4 import BeautifulSoup

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
        
        if has_value and a.type:
            is_valid = _eval_attribute_type(val, a.type)
            if not is_valid:
                if a.type == AttributeType.NUMBER:
                    error_msg = f"Expected a number but got '{val}'"
                elif a.type == AttributeType.EMAIL:
                    error_msg = f"Expected an email but got '{val}'"
                elif a.type == AttributeType.DATE:
                    error_msg = f"Expected a date in format DD-MM-YYYY but got '{val}'"
                elif a.type == AttributeType.TEXT:
                    error_msg = f"Expected text but got '{val}'"
                else:
                    error_msg = f"Invalid value '{val}'"
                
                missing.append({
                    "label": label, 
                    "attributeId": attribute_id, 
                    "error": error_msg, 
                    "value": val
                })

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

def _eval_attribute_type(value: any, expected_type: AttributeType):
    if value is None or value == "":
        return True
    
    try:
        if expected_type == AttributeType.NUMBER:
            float(value)
            return True
        elif expected_type == AttributeType.EMAIL:
            return re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", str(value)) is not None
        elif expected_type == AttributeType.DATE:
            datetime.strptime(value, "%d-%m-%Y")
            return True
        elif expected_type == AttributeType.TEXT:
            return isinstance(value, str)
        else:
            return False
    except Exception:
        return False


def _eval_item(item: TemplateRuleConditionItem, values: dict) -> bool:
    if item is None:
        return False

    field = item.fieldKey
    operator = item.operator
    right = item.value

    # Fetch left operand's value from `values` using fieldKey; if missing, it will be treated as None
    left = values.get(field)

    op_name = str(operator).lower()
    op_map = {
        'equals': 'eq', 'equal': 'eq', '==': 'eq',
        'not_equals': 'neq', 'notequals': 'neq', '!=': 'neq',
        'matches': 'regex',
        'greater_than': 'gt',
        'greater_than_or_equal': 'gte',
        'less_than': 'lt',
        'less_than_or_equal': 'lte'
    }

    mapped = op_map.get(op_name, op_name)

    # Numeric comparisons
    try:
        if mapped == 'eq':
            return left == right
        if mapped == 'neq':
            return left != right
        if mapped == 'gt':
            return float(left) > float(right)
        if mapped == 'gte':
            return float(left) >= float(right)
        if mapped == 'lt':
            return float(left) < float(right)
        if mapped == 'lte':
            return float(left) <= float(right)
    except (TypeError, ValueError):
        pass

    # List or string containment
    if mapped == 'in':
        try:
            return left in right
        except Exception:
            return False

    # List or string containment
    if mapped == 'contains':
        try:
            return (isinstance(left, str) and str(right) in left) or (isinstance(left, (list, tuple)) and right in left)
        except Exception:
            return False

    # Regex match - right is pattern, left is tested string
    if mapped == 'regex':
        try:
            pattern = re.compile(str(right))
            return bool(pattern.search('' if left is None else str(left)))
        except re.error:
            return False

    # Exists check - true if left value is provided (not None or empty string), right value is ignored
    if mapped == 'exists':
        return left is not None and not (isinstance(left, str) and left == "")

    # Unknown operator - for safety, return False
    return False

def evaluate_condition(node: TemplateRuleCondition, values: dict) -> bool:
    if not node:
        return False

    join = node.join
    items = node.items

    results = [_eval_item(it, values) for it in items]
    return all(results) if join == 'and' else any(results)

def evaluate_rule(rule: TemplateRule, values: dict) -> dict:
    rule_id = rule.ruleId
    cond = rule.condition
    action_type = rule.action
    passed = evaluate_condition(cond, values)

    return {'id': rule_id, 'passed': passed, 'action': action_type}

def evaluate_rules(rules: list[TemplateRule], values: dict) -> list[dict]:
    return [evaluate_rule(r, values) for r in rules or []]

def apply_rules_to_html(rules: list[TemplateRule], html_content: str, values: dict) -> str:
    """Apply rule results to HTML content and return modified HTML.

    For each rule we look up an element with `id` equal to the rule id. The rule's
    `action` decides semantics:
    - action 'show'  -> element is kept when condition passed, removed otherwise
    - action 'hide'  -> element is removed when condition passed, kept otherwise

    Elements are removed from the output using BeautifulSoup's `decompose()`.
    """
    if not html_content:
        return ""

    results = evaluate_rules(rules, values)

    soup = BeautifulSoup(html_content, 'html.parser')

    for res in results:
        rule_id = res.get('id')
        if not rule_id:
            continue
        el = soup.find(id=rule_id)
        if not el:
            continue

        action = res.get('action', 'show')
        passed = res.get('passed', False)

        # Determine whether element should be visible after applying rule
        if action == 'show':
            visible = bool(passed)
        else:  # 'hide'
            visible = not bool(passed)

        if not visible:
            el.decompose()

    return str(soup)
