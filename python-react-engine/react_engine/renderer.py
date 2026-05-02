"""
Renders a JsxElement AST tree to a formatted TSX string.

Layout rules
------------
Props on one line when the opening tag fits within MAX_LINE_WIDTH columns
*and* there are no more than INLINE_PROP_LIMIT props.  Otherwise each prop
gets its own indented line.

Children are always placed on their own indented line(s) below the opening
tag, with the closing tag on its own line — this keeps multi-child trees
readable regardless of child length.

Indentation unit: 2 spaces.
"""
from __future__ import annotations

from .nodes import Child, JsxElement, JsxExpression, JsxProp, JsxText

INDENT = "  "
MAX_LINE_WIDTH = 80
INLINE_PROP_LIMIT = 2   # at most this many props can stay on one line


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def render(element: JsxElement, base_indent: int = 0) -> str:
    """Serialize *element* (and all its descendants) to a TSX string."""
    return _render_element(element, base_indent)


# ---------------------------------------------------------------------------
# Element rendering
# ---------------------------------------------------------------------------

def _render_element(el: JsxElement, depth: int) -> str:
    ind = INDENT * depth
    inner = INDENT * (depth + 1)

    rendered_props = [_render_prop(p) for p in el.props]

    # Decide prop layout: inline vs multi-line
    single_line_props = " ".join(rendered_props)
    opening_candidate = (
        f"<{el.tag} {single_line_props} />"
        if el.is_self_closing
        else f"<{el.tag} {single_line_props}>"
    )
    use_multiline = rendered_props and (
        len(ind + opening_candidate) > MAX_LINE_WIDTH
        or len(rendered_props) > INLINE_PROP_LIMIT
    )

    if use_multiline:
        prop_lines = "\n".join(f"{inner}{p}" for p in rendered_props)
        if el.is_self_closing:
            return f"{ind}<{el.tag}\n{prop_lines}\n{ind}/>"
        opening = f"{ind}<{el.tag}\n{prop_lines}\n{ind}>"
    else:
        props_str = (f" {single_line_props}" if rendered_props else "")
        if el.is_self_closing:
            return f"{ind}<{el.tag}{props_str} />"
        opening = f"{ind}<{el.tag}{props_str}>"

    # --- parent element: render children ---
    rendered_children = [_render_child(c, depth + 1) for c in el.children]
    body = "\n".join(rendered_children)
    closing = f"{ind}</{el.tag}>"
    return f"{opening}\n{body}\n{closing}"


def _render_child(child: Child, depth: int) -> str:
    if isinstance(child, JsxText):
        return f"{INDENT * depth}{child.content}"
    return _render_element(child, depth)


# ---------------------------------------------------------------------------
# Prop rendering
# ---------------------------------------------------------------------------

def _render_prop(prop: JsxProp) -> str:
    v = prop.value

    if isinstance(v, bool):
        # Boolean shorthand: disabled (true) or disabled={false}
        return prop.name if v else f"{prop.name}={{false}}"

    if isinstance(v, str):
        escaped = v.replace("\\", "\\\\").replace('"', '\\"')
        return f'{prop.name}="{escaped}"'

    if isinstance(v, (int, float)):
        return f"{prop.name}={{{v}}}"

    if isinstance(v, JsxExpression):
        return f"{prop.name}={{{v.content}}}"

    # Fallback — should never reach here with well-typed input
    return f'{prop.name}="{v}"'
