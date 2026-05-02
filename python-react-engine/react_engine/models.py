"""
Dataclass representations of the ComponentSchema returned by the
get_component_schema MCP tool.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class PropDefinition:
    """Describes a single prop as returned by react-docgen-typescript."""

    type: str
    """Resolved type name: 'string', 'boolean', 'number', 'enum', 'ReactNode',
    'MouseEventHandler<...>', '() => void', etc."""

    required: bool
    """True when the prop appears in the component's requiredProps list."""

    defaultValue: Any
    """Python-native default: str, bool, int/float, or None when absent."""

    description: str
    """JSDoc description extracted from the source file."""

    rawType: str | None = None
    """Raw TypeScript type string, e.g. 'ButtonVariant' or '"a" | "b" | "c"'.
    Present only when it differs from the resolved type name."""


@dataclass(frozen=True)
class ComponentSchema:
    """Full component schema as returned by get_component_schema."""

    component: str
    displayName: str
    description: str
    filePath: str
    props: dict[str, PropDefinition]
    requiredProps: list[str]
    optionalProps: list[str]

    # Derived: stable prop ordering (required first, then optional, schema order preserved)
    @property
    def ordered_prop_names(self) -> list[str]:
        return self.requiredProps + self.optionalProps

    @classmethod
    def from_dict(cls, data: dict) -> ComponentSchema:
        """Parse a raw schema dict (as returned by the MCP tool) into a ComponentSchema."""
        props: dict[str, PropDefinition] = {}
        for name, raw in data["props"].items():
            props[name] = PropDefinition(
                type=raw["type"],
                required=raw["required"],
                defaultValue=raw.get("defaultValue"),
                description=raw.get("description", ""),
                rawType=raw.get("rawType"),
            )
        return cls(
            component=data["component"],
            displayName=data["displayName"],
            description=data.get("description", ""),
            filePath=data["filePath"],
            props=props,
            requiredProps=list(data["requiredProps"]),
            optionalProps=list(data["optionalProps"]),
        )
