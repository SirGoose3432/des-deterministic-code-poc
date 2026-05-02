"""
Builds a JsxElement AST from a validated ComponentSchema + props dict.

The builder is responsible for:
  - Ordering props exactly as declared in the schema (required → optional)
  - Coercing Python values to the correct PropValue variant
  - Routing 'children' to JSX children rather than an attribute
  - Accepting raw string children or nested JsxElement trees
"""
from __future__ import annotations

from typing import Any, Union

from .models import ComponentSchema, PropDefinition
from .nodes import Child, JsxElement, JsxExpression, JsxProp, JsxText, PropValue

# Types whose values should be emitted as raw JS expressions rather than
# quoted strings.  Matched as substrings of prop_def.type.
_EXPRESSION_TYPE_SUBSTRINGS = (
    "Handler",   # MouseEventHandler, ChangeEventHandler, …
    "() =>",     # arrow function signatures
    "Function",  # ReactEventHandler, etc.
    "Dispatch",  # React.Dispatch
    "Ref",       # RefObject / ForwardedRef
)


def build(
    schema: ComponentSchema,
    props: dict[str, Any],
    children: Union[str, list[Child], None] = None,
) -> JsxElement:
    """
    Construct a JsxElement from *schema* and the caller-supplied *props*.

    Parameters
    ----------
    schema:
        Parsed ComponentSchema (output of ComponentSchema.from_dict).
    props:
        Dict of prop names → Python-native values, already validated.
        ``None`` values are silently dropped (use the prop's default).
    children:
        Optional children content.  May be a plain string, a list of
        ``JsxElement``/``JsxText`` nodes, or ``None``.
        If the schema lists 'children' in requiredProps *and* a string is
        provided here, it is used as the child text node.

    Returns
    -------
    JsxElement
        Ready to be passed to the renderer.
    """
    jsx_props: list[JsxProp] = []

    # Walk props in schema-defined order so output is always deterministic.
    for name in schema.ordered_prop_names:
        if name == "children":
            continue  # handled separately below
        if name not in props or props[name] is None:
            continue
        value = props[name]
        prop_def = schema.props[name]
        jsx_props.append(JsxProp(name=name, value=_coerce(value, prop_def)))

    # Build children list
    jsx_children: list[Child] = []

    if children is not None:
        if isinstance(children, str):
            jsx_children.append(JsxText(content=children))
        elif isinstance(children, list):
            for item in children:
                if isinstance(item, str):
                    jsx_children.append(JsxText(content=item))
                elif isinstance(item, (JsxElement, JsxText)):
                    jsx_children.append(item)

    return JsxElement(tag=schema.displayName, props=jsx_props, children=jsx_children)


# ---------------------------------------------------------------------------
# Internal coercion
# ---------------------------------------------------------------------------

def _coerce(value: Any, defn: PropDefinition) -> PropValue:
    """Map a Python-native value to the correct JSX PropValue variant."""
    t = defn.type

    if t == "boolean":
        # Python bool → literal true/false; string → JS variable expression.
        if isinstance(value, str):
            return JsxExpression(content=value)
        return bool(value)

    if t in ("string", "enum"):
        return str(value)

    if t == "number":
        return value  # int or float, passed through

    # Function / handler types — the caller must pass a TS expression string.
    if any(sub in t for sub in _EXPRESSION_TYPE_SUBSTRINGS):
        return JsxExpression(content=str(value))

    # ReactNode and other complex types — wrap as expression if not already str.
    if isinstance(value, str):
        return JsxExpression(content=value)

    # Fallback — coerce to string expression.
    return JsxExpression(content=str(value))
