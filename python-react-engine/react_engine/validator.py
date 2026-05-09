"""
Schema-driven prop validation.

Validates a caller-supplied props dict against a ComponentSchema before
the AST builder runs. Catches wrong types, missing required props, and
unknown prop names.  For inline enum types (e.g. '"a" | "b" | "c"') it
also validates that the value is one of the declared literals.
"""
from __future__ import annotations

import re
from typing import Any

from .models import ComponentSchema, PropDefinition

# Matches quoted string literals in a TypeScript union: "a" | "b" | "c"
_INLINE_LITERALS_RE = re.compile(r'"([^"]*)"')


class ValidationError(Exception):
    """Raised when the supplied props are incompatible with the schema."""

    def __init__(self, message: str, prop: str | None = None) -> None:
        super().__init__(message)
        self.prop = prop


class SchemaError(Exception):
    """Raised when the schema dict itself is missing required keys."""


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def validate(schema: ComponentSchema, props: dict[str, Any]) -> None:
    """
    Validate *props* against *schema*.

    Raises
    ------
    ValidationError
        On the first validation failure found.  Contains a human-readable
        message and a ``prop`` attribute naming the offending prop.
    """
    _check_required(schema, props)
    _check_unknown(schema, props)
    _check_types(schema, props)


# ---------------------------------------------------------------------------
# Internal checks
# ---------------------------------------------------------------------------

def _check_required(schema: ComponentSchema, props: dict[str, Any]) -> None:
    for name in schema.requiredProps:
        # 'children' is satisfied through the separate children argument.
        if name == "children":
            continue
        if name not in props or props[name] is None:
            defn = schema.props.get(name)
            hint = f" — {defn.description}" if defn and defn.description else ""
            raise ValidationError(
                f"Required prop '{name}' is missing{hint}.",
                prop=name,
            )


def _check_unknown(schema: ComponentSchema, props: dict[str, Any]) -> None:
    known = set(schema.props)
    unknown = sorted(k for k in props if k not in known)
    if unknown:
        raise ValidationError(
            f"Unknown prop(s) {unknown}. "
            f"Valid props for '{schema.component}': {sorted(known)}.",
            prop=unknown[0],
        )


def _check_types(schema: ComponentSchema, props: dict[str, Any]) -> None:
    for name, value in props.items():
        if value is None:
            continue  # explicit null → prop will be omitted; not a type error
        _check_single(name, value, schema.props[name])


def _check_single(name: str, value: Any, defn: PropDefinition) -> None:
    t = defn.type

    if t == "string":
        if not isinstance(value, str):
            raise ValidationError(
                f"Prop '{name}' expects a string, got {type(value).__name__}.",
                prop=name,
            )

    elif t == "boolean":
        # Accept Python bool (True/False → literal) OR a string expression
        # (e.g. "isOpen" → {isOpen}, for wiring to a JS variable at callsite).
        # Reject int 0/1 to catch accidental mistakes.
        if isinstance(value, bool):
            pass  # ok
        elif isinstance(value, str):
            pass  # treated as a JS expression by the builder
        else:
            raise ValidationError(
                f"Prop '{name}' expects a boolean (True/False) or a "
                f"string JS expression, got {type(value).__name__}.",
                prop=name,
            )

    elif t == "number":
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValidationError(
                f"Prop '{name}' expects a number, got {type(value).__name__}.",
                prop=name,
            )

    elif t == "enum":
        if not isinstance(value, str):
            raise ValidationError(
                f"Prop '{name}' expects a string enum value, "
                f"got {type(value).__name__}.",
                prop=name,
            )
        # If the rawType is an inline literal union we can verify the value.
        if defn.rawType:
            allowed = _INLINE_LITERALS_RE.findall(defn.rawType)
            if allowed and value not in allowed:
                raise ValidationError(
                    f"Prop '{name}' value '{value}' is not allowed. "
                    f"Expected one of: {allowed}.",
                    prop=name,
                )

    # Function, ReactNode, array, object, and other complex types — accept a
    # string JS expression, or a native list/dict (JSON-serialized by builder).
    elif isinstance(value, (str, list, dict)):
        pass  # accepted

    else:
        raise ValidationError(
            f"Prop '{name}' has schema type '{t}'. "
            f"Supply a string expression or a JSON-serialisable list/dict.",
            prop=name,
        )
