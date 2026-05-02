"""
Public API for the Python AST engine.

Typical usage
-------------
    from ast_engine import generate

    jsx = generate(schema_dict, {"label": "Submit", "variant": "primary"})
    # → '<Button label="Submit" variant="primary" />'

    component = generate(
        schema_dict,
        {"label": "Submit"},
        mode="component",
        component_name="SubmitButton",
    )
    # → a full React component function with import and export
"""
from __future__ import annotations

from typing import Any, Literal, Union

from .builder import build
from .models import ComponentSchema
from .nodes import Child, JsxElement
from .renderer import render
from .validator import SchemaError, ValidationError, validate

__all__ = ["generate", "ValidationError", "SchemaError"]


def generate(
    schema_dict: dict,
    props: dict[str, Any],
    children: Union[str, list[Child], None] = None,
    *,
    mode: Literal["jsx", "component"] = "jsx",
    component_name: str | None = None,
) -> str:
    """
    Generate a React TSX snippet from a component schema and desired props.

    The output is **deterministic**: identical inputs always produce identical
    output, with no LLM involvement.  Prop ordering follows the schema
    (required props first, then optional, in declaration order).

    Parameters
    ----------
    schema_dict:
        Raw dict as returned by the ``get_component_ast_schema`` MCP tool.
    props:
        Desired props to apply.  ``None`` values are silently dropped so
        callers can pass the full optional-props dict with nulls.
    children:
        Optional children content.  Pass a plain string for text children,
        or a list of ``JsxElement`` / ``JsxText`` nodes for nested markup.
        Required when the schema declares ``children`` in ``requiredProps``.
    mode:
        ``"jsx"``       – return just the JSX element string (default).
        ``"component"`` – wrap in a named React function component with an
                          import statement.
    component_name:
        Name for the generated wrapper function (``mode="component"`` only).
        Defaults to ``"Generated{DisplayName}"``.

    Returns
    -------
    str
        Formatted TSX code ready to paste into a TypeScript React project.

    Raises
    ------
    SchemaError
        When *schema_dict* is missing required keys.
    ValidationError
        When *props* violate the schema (wrong types, missing required props,
        unknown prop names, invalid enum values).
    """
    schema = _parse_schema(schema_dict)
    validate(schema, props)
    element = build(schema, props, children)

    if mode == "component":
        return _wrap_component(element, schema, component_name)
    return render(element)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_schema(data: dict) -> ComponentSchema:
    required_keys = {"component", "displayName", "filePath", "props",
                     "requiredProps", "optionalProps"}
    missing = required_keys - set(data)
    if missing:
        raise SchemaError(
            f"Schema dict is missing required keys: {sorted(missing)}"
        )
    return ComponentSchema.from_dict(data)


def _wrap_component(
    element: JsxElement,
    schema: ComponentSchema,
    name: str | None,
) -> str:
    fn_name = name or f"Generated{schema.displayName}"
    # Indent the JSX element by 4 spaces (inside the return statement)
    jsx = render(element, base_indent=2)

    lines = [
        f"import {{ {schema.displayName} }} from 'ui-design-system';",
        "",
        f"export default function {fn_name}(): JSX.Element {{",
        "  return (",
        jsx,
        "  );",
        "}",
    ]
    return "\n".join(lines)
