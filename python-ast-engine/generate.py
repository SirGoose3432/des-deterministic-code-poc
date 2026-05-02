#!/usr/bin/env python3
"""
CLI entry point for the Python AST engine.

Usage
-----
    # Pipe schema JSON on stdin, props as argument
    cat schema.json | python generate.py --props '{"label": "Submit"}'

    # Both as arguments
    python generate.py --schema schema.json --props '{"label":"Submit","variant":"primary"}'

    # With children (for components like Modal)
    python generate.py --schema modal_schema.json \\
        --props '{"isOpen":"isOpen","onClose":"handleClose","title":"Confirm"}' \\
        --children "Are you sure?"

    # Wrap in a full React component
    python generate.py --schema schema.json --props '{"label":"Submit"}' \\
        --mode component --name SubmitButton
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from ast_engine import generate
from ast_engine.validator import ValidationError, SchemaError


def _load_json(value: str) -> dict:
    """Try to parse *value* as a JSON string; fall back to treating it as a path."""
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        path = Path(value)
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
        raise ValueError(
            f"Could not parse '{value}' as JSON or find it as a file path."
        )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate React TSX code deterministically from a component schema.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--schema",
        metavar="JSON_OR_PATH",
        help=(
            "Component schema as a JSON string or path to a .json file. "
            "If omitted, the schema is read from stdin."
        ),
    )
    parser.add_argument(
        "--props",
        required=True,
        metavar="JSON",
        help="Props to apply as a JSON object, e.g. '{\"label\": \"Submit\"}'.",
    )
    parser.add_argument(
        "--children",
        metavar="TEXT",
        default=None,
        help="Text children to place inside the element (e.g. for Modal).",
    )
    parser.add_argument(
        "--mode",
        choices=["jsx", "component"],
        default="jsx",
        help=(
            "Output mode: 'jsx' (default) returns just the JSX element; "
            "'component' wraps it in a full React function component."
        ),
    )
    parser.add_argument(
        "--name",
        metavar="COMPONENT_NAME",
        default=None,
        help="Name for the generated wrapper function (component mode only).",
    )

    args = parser.parse_args(argv)

    # Load schema
    if args.schema:
        try:
            schema_dict = _load_json(args.schema)
        except (ValueError, json.JSONDecodeError) as exc:
            print(f"error: invalid --schema: {exc}", file=sys.stderr)
            return 1
    elif not sys.stdin.isatty():
        try:
            schema_dict = json.load(sys.stdin)
        except json.JSONDecodeError as exc:
            print(f"error: stdin is not valid JSON: {exc}", file=sys.stderr)
            return 1
    else:
        print("error: provide --schema or pipe schema JSON on stdin.", file=sys.stderr)
        parser.print_usage(sys.stderr)
        return 1

    # Load props
    try:
        props = _load_json(args.props)
    except (ValueError, json.JSONDecodeError) as exc:
        print(f"error: invalid --props: {exc}", file=sys.stderr)
        return 1

    # Generate
    try:
        output = generate(
            schema_dict,
            props,
            children=args.children,
            mode=args.mode,
            component_name=args.name,
        )
    except SchemaError as exc:
        print(f"schema error: {exc}", file=sys.stderr)
        return 2
    except ValidationError as exc:
        prop_hint = f" (prop: '{exc.prop}')" if exc.prop else ""
        print(f"validation error{prop_hint}: {exc}", file=sys.stderr)
        return 3

    print(output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
