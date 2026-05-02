"""
End-to-end tests for the Python AST engine.

Each test uses schema dicts that mirror the exact output produced by the
get_component_ast_schema MCP tool so they validate the full pipeline.
"""
from __future__ import annotations

import pytest

from ast_engine import generate
from ast_engine.nodes import JsxElement, JsxProp, JsxText, JsxExpression
from ast_engine.validator import ValidationError, SchemaError


# ---------------------------------------------------------------------------
# Fixture schemas  (mirrors real MCP output)
# ---------------------------------------------------------------------------

BUTTON_SCHEMA: dict = {
    "component": "Button",
    "displayName": "Button",
    "description": "",
    "filePath": "/fake/Button.tsx",
    "props": {
        "label":     {"type": "string",  "required": True,  "defaultValue": None,     "description": "The visible text label rendered inside the button."},
        "variant":   {"type": "enum",    "required": False, "defaultValue": "primary", "description": "Visual style variant.", "rawType": "ButtonVariant"},
        "size":      {"type": "enum",    "required": False, "defaultValue": "md",      "description": "Controls padding and font-size.", "rawType": "ButtonSize"},
        "disabled":  {"type": "boolean", "required": False, "defaultValue": False,     "description": "Disables interaction."},
        "loading":   {"type": "boolean", "required": False, "defaultValue": False,     "description": "Shows a loading spinner."},
        "fullWidth": {"type": "boolean", "required": False, "defaultValue": False,     "description": "Stretches to fill container."},
        "type":      {"type": "enum",    "required": False, "defaultValue": "button",  "description": "HTML button type.", "rawType": '"button" | "submit" | "reset"'},
        "onClick":   {"type": "MouseEventHandler<HTMLButtonElement>", "required": False, "defaultValue": None, "description": "Click handler."},
    },
    "requiredProps": ["label"],
    "optionalProps": ["variant", "size", "disabled", "loading", "fullWidth", "type", "onClick"],
}

TEXT_INPUT_SCHEMA: dict = {
    "component": "TextInput",
    "displayName": "TextInput",
    "description": "",
    "filePath": "/fake/TextInput.tsx",
    "props": {
        "id":          {"type": "string",  "required": True,  "defaultValue": None,   "description": "Unique id."},
        "label":       {"type": "string",  "required": True,  "defaultValue": None,   "description": "Visible label."},
        "value":       {"type": "string",  "required": True,  "defaultValue": None,   "description": "Controlled value."},
        "onChange":    {"type": "() => void", "required": True, "defaultValue": None, "description": "Change handler."},
        "type":        {"type": "enum",    "required": False, "defaultValue": "text",  "description": "Input type.", "rawType": "TextInputType"},
        "placeholder": {"type": "string",  "required": False, "defaultValue": None,   "description": "Placeholder text."},
        "error":       {"type": "string",  "required": False, "defaultValue": None,   "description": "Error message."},
        "hint":        {"type": "string",  "required": False, "defaultValue": None,   "description": "Hint text."},
        "required":    {"type": "boolean", "required": False, "defaultValue": False,   "description": "Marks field required."},
        "disabled":    {"type": "boolean", "required": False, "defaultValue": False,   "description": "Disables field."},
        "readOnly":    {"type": "boolean", "required": False, "defaultValue": False,   "description": "Makes read-only."},
    },
    "requiredProps": ["id", "label", "value", "onChange"],
    "optionalProps": ["type", "placeholder", "error", "hint", "required", "disabled", "readOnly"],
}

MODAL_SCHEMA: dict = {
    "component": "Modal",
    "displayName": "Modal",
    "description": "",
    "filePath": "/fake/Modal.tsx",
    "props": {
        "isOpen":               {"type": "boolean",    "required": True,  "defaultValue": None,  "description": "Whether visible."},
        "onClose":              {"type": "() => void", "required": True,  "defaultValue": None,  "description": "Close callback."},
        "title":                {"type": "string",     "required": True,  "defaultValue": None,  "description": "Header title."},
        "children":             {"type": "ReactNode",  "required": True,  "defaultValue": None,  "description": "Body content."},
        "size":                 {"type": "enum",       "required": False, "defaultValue": "md",  "description": "Panel width.", "rawType": "ModalSize"},
        "closeOnBackdropClick": {"type": "boolean",    "required": False, "defaultValue": True,  "description": "Backdrop dismiss."},
        "showCloseButton":      {"type": "boolean",    "required": False, "defaultValue": True,  "description": "Show × button."},
    },
    "requiredProps": ["isOpen", "onClose", "title", "children"],
    "optionalProps": ["size", "closeOnBackdropClick", "showCloseButton"],
}


# ===========================================================================
# Button — JSX mode
# ===========================================================================

class TestButtonJsx:
    def test_minimal_required_only(self):
        result = generate(BUTTON_SCHEMA, {"label": "Submit"})
        assert result == '<Button label="Submit" />'

    def test_prop_order_follows_schema(self):
        # Required props before optional, both in schema declaration order.
        result = generate(BUTTON_SCHEMA, {"variant": "secondary", "label": "Go"})
        assert result.index("label") < result.index("variant")

    def test_string_prop_double_quoted(self):
        result = generate(BUTTON_SCHEMA, {"label": "Hello"})
        assert 'label="Hello"' in result

    def test_enum_prop_double_quoted(self):
        result = generate(BUTTON_SCHEMA, {"label": "X", "variant": "danger"})
        assert 'variant="danger"' in result

    def test_boolean_true_shorthand(self):
        result = generate(BUTTON_SCHEMA, {"label": "X", "disabled": True})
        assert "disabled" in result
        assert "disabled={true}" not in result  # must use shorthand

    def test_boolean_false_explicit(self):
        result = generate(BUTTON_SCHEMA, {"label": "X", "disabled": False})
        assert "disabled={false}" in result

    def test_function_prop_as_expression(self):
        result = generate(BUTTON_SCHEMA, {"label": "X", "onClick": "handleClick"})
        assert "onClick={handleClick}" in result

    def test_none_prop_omitted(self):
        result = generate(BUTTON_SCHEMA, {"label": "X", "variant": None})
        assert "variant" not in result

    def test_self_closing_no_children(self):
        result = generate(BUTTON_SCHEMA, {"label": "X"})
        assert result.endswith("/>")
        assert "</" not in result

    def test_multiline_layout_many_props(self):
        result = generate(BUTTON_SCHEMA, {
            "label": "Save changes",
            "variant": "primary",
            "size": "lg",
            "disabled": False,
            "loading": True,
            "fullWidth": True,
        })
        # More than INLINE_PROP_LIMIT props → each on its own line
        lines = result.splitlines()
        assert len(lines) > 2

    def test_multiline_props_indented(self):
        result = generate(BUTTON_SCHEMA, {
            "label": "A",
            "variant": "secondary",
            "size": "sm",
        })
        for line in result.splitlines()[1:]:  # skip opening tag line
            if line.strip() and not line.strip().startswith("/>"):
                assert line.startswith("  "), f"Expected 2-space indent: {line!r}"

    def test_inline_enum_validation_accepts_valid(self):
        # "button" | "submit" | "reset" are the only allowed values for `type`
        result = generate(BUTTON_SCHEMA, {"label": "X", "type": "submit"})
        assert 'type="submit"' in result

    def test_deterministic_identical_inputs(self):
        props = {"label": "Hi", "variant": "ghost", "size": "md"}
        assert generate(BUTTON_SCHEMA, props) == generate(BUTTON_SCHEMA, props)


# ===========================================================================
# Button — component mode
# ===========================================================================

class TestButtonComponent:
    def test_includes_import(self):
        result = generate(BUTTON_SCHEMA, {"label": "X"}, mode="component")
        assert "import { Button } from 'ui-design-system';" in result

    def test_export_default_function(self):
        result = generate(BUTTON_SCHEMA, {"label": "X"}, mode="component")
        assert "export default function Generated" in result

    def test_custom_component_name(self):
        result = generate(BUTTON_SCHEMA, {"label": "X"},
                          mode="component", component_name="MyButton")
        assert "function MyButton" in result

    def test_jsx_is_inside_return(self):
        result = generate(BUTTON_SCHEMA, {"label": "X"}, mode="component")
        assert "return (" in result
        assert "<Button" in result

    def test_return_type_annotation(self):
        result = generate(BUTTON_SCHEMA, {"label": "X"}, mode="component")
        assert "JSX.Element" in result


# ===========================================================================
# TextInput — JSX mode
# ===========================================================================

class TestTextInputJsx:
    def _base_props(self) -> dict:
        return {
            "id": "email",
            "label": "Email",
            "value": "user@example.com",
            "onChange": "setEmail",
        }

    def test_minimal(self):
        result = generate(TEXT_INPUT_SCHEMA, self._base_props())
        assert "<TextInput" in result
        assert 'id="email"' in result
        assert 'label="Email"' in result
        assert 'value="user@example.com"' in result
        assert "onChange={setEmail}" in result

    def test_required_props_in_order(self):
        result = generate(TEXT_INPUT_SCHEMA, self._base_props())
        assert result.index("id=") < result.index("label=")
        assert result.index("label=") < result.index("value=")
        assert result.index("value=") < result.index("onChange=")

    def test_optional_error_prop(self):
        props = {**self._base_props(), "error": "Invalid email."}
        result = generate(TEXT_INPUT_SCHEMA, props)
        assert 'error="Invalid email."' in result

    def test_required_boolean(self):
        props = {**self._base_props(), "required": True}
        result = generate(TEXT_INPUT_SCHEMA, props)
        assert "required" in result
        assert "required={true}" not in result  # shorthand

    def test_function_type_for_onChange(self):
        props = {**self._base_props(), "onChange": "(v) => setState(v)"}
        result = generate(TEXT_INPUT_SCHEMA, props)
        assert "onChange={(v) => setState(v)}" in result


# ===========================================================================
# Modal — JSX mode with children
# ===========================================================================

class TestModalJsx:
    def _base_props(self) -> dict:
        return {
            "isOpen": "open",
            "onClose": "handleClose",
            "title": "Confirm action",
        }

    def test_with_text_children(self):
        result = generate(MODAL_SCHEMA, self._base_props(),
                          children="Are you sure?")
        assert "<Modal" in result
        assert "Are you sure?" in result
        assert "</Modal>" in result

    def test_self_closing_without_children(self):
        # children is required by schema but engine skips children validation
        result = generate(MODAL_SCHEMA, self._base_props())
        # No children → self-closing
        assert "/>" in result

    def test_isopen_as_expression(self):
        result = generate(MODAL_SCHEMA, self._base_props(), children="…")
        assert "isOpen={open}" in result

    def test_onclose_as_expression(self):
        result = generate(MODAL_SCHEMA, self._base_props(), children="…")
        assert "onClose={handleClose}" in result

    def test_title_as_string(self):
        result = generate(MODAL_SCHEMA, self._base_props(), children="…")
        assert 'title="Confirm action"' in result

    def test_size_enum(self):
        props = {**self._base_props(), "size": "lg"}
        result = generate(MODAL_SCHEMA, props, children="…")
        assert 'size="lg"' in result

    def test_close_on_backdrop_false(self):
        props = {**self._base_props(), "closeOnBackdropClick": False}
        result = generate(MODAL_SCHEMA, props, children="…")
        assert "closeOnBackdropClick={false}" in result

    def test_nested_element_child(self):
        child_el = JsxElement(
            tag="Button",
            props=[JsxProp(name="label", value="OK")],
        )
        result = generate(MODAL_SCHEMA, self._base_props(), children=[child_el])
        assert '<Button label="OK" />' in result
        assert "</Modal>" in result

    def test_multiline_with_children(self):
        result = generate(MODAL_SCHEMA, self._base_props(), children="Body text")
        lines = result.splitlines()
        # Opening tag, child line, closing tag — at minimum 3 lines
        assert len(lines) >= 3
        assert lines[-1].strip() == "</Modal>"


# ===========================================================================
# Validation errors
# ===========================================================================

class TestValidationErrors:
    def test_missing_required_prop(self):
        with pytest.raises(ValidationError) as exc_info:
            generate(BUTTON_SCHEMA, {})
        assert exc_info.value.prop == "label"

    def test_missing_required_prop_message(self):
        with pytest.raises(ValidationError, match="label"):
            generate(BUTTON_SCHEMA, {})

    def test_unknown_prop(self):
        with pytest.raises(ValidationError) as exc_info:
            generate(BUTTON_SCHEMA, {"label": "X", "colour": "red"})
        assert exc_info.value.prop == "colour"

    def test_wrong_type_string_expected(self):
        with pytest.raises(ValidationError, match="string"):
            generate(BUTTON_SCHEMA, {"label": 42})

    def test_wrong_type_boolean_expected(self):
        # Strings are accepted as JS expressions; only non-bool/non-str types fail.
        with pytest.raises(ValidationError, match="boolean"):
            generate(BUTTON_SCHEMA, {"label": "X", "disabled": ["not", "a", "bool"]})

    def test_int_rejected_for_boolean(self):
        # 1 looks truthy but must be rejected — require explicit True/False
        with pytest.raises(ValidationError, match="boolean"):
            generate(BUTTON_SCHEMA, {"label": "X", "disabled": 1})

    def test_invalid_inline_enum_value(self):
        # "type" has rawType '"button" | "submit" | "reset"'
        with pytest.raises(ValidationError, match="'rocket'"):
            generate(BUTTON_SCHEMA, {"label": "X", "type": "rocket"})

    def test_valid_inline_enum_passes(self):
        result = generate(BUTTON_SCHEMA, {"label": "X", "type": "reset"})
        assert 'type="reset"' in result

    def test_multiple_unknown_props(self):
        with pytest.raises(ValidationError):
            generate(BUTTON_SCHEMA, {"label": "X", "foo": 1, "bar": 2})


# ===========================================================================
# Schema errors
# ===========================================================================

class TestSchemaErrors:
    def test_missing_required_schema_key(self):
        bad = {k: v for k, v in BUTTON_SCHEMA.items() if k != "props"}
        with pytest.raises(SchemaError, match="props"):
            generate(bad, {"label": "X"})

    def test_empty_schema(self):
        with pytest.raises(SchemaError):
            generate({}, {"label": "X"})


# ===========================================================================
# Renderer edge cases
# ===========================================================================

class TestRenderer:
    def test_string_with_double_quote_escaped(self):
        result = generate(BUTTON_SCHEMA, {"label": 'Say "hello"'})
        assert r'Say \"hello\"' in result

    def test_no_props_element(self):
        # Pathological case: schema with no required props and empty props dict
        schema = {**BUTTON_SCHEMA, "requiredProps": [], "optionalProps": []}
        result = generate(schema, {})
        assert result == "<Button />"
