"""
Minimal TSX AST node types.

The tree is intentionally small — just enough to represent a single
self-closing or parent JSX element with typed prop values.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Union


# ---------------------------------------------------------------------------
# Prop value types
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class JsxExpression:
    """
    A raw JavaScript/TypeScript expression rendered inside curly braces.

    Examples
    --------
    JsxExpression("handleClick")      → {handleClick}
    JsxExpression("() => void 0")     → {() => void 0}
    JsxExpression("<ChildComponent />")→ {<ChildComponent />}
    """
    content: str


# A prop value is one of: plain string, bool, int/float, or a raw JS expression.
PropValue = Union[str, bool, int, float, JsxExpression]


# ---------------------------------------------------------------------------
# Tree nodes
# ---------------------------------------------------------------------------

@dataclass
class JsxProp:
    """A single JSX attribute on an element."""
    name: str
    value: PropValue


@dataclass
class JsxText:
    """A text node child inside a JSX element."""
    content: str


Child = Union["JsxElement", JsxText]


@dataclass
class JsxElement:
    """
    A JSX element node — either self-closing or with children.

    Rendering rules
    ---------------
    - Self-closing when ``children`` is empty: ``<Tag prop="x" />``
    - Parent when children exist:
        ``<Tag prop="x">\\n  <Child />\\n</Tag>``
    """
    tag: str
    props: list[JsxProp] = field(default_factory=list)
    children: list[Child] = field(default_factory=list)

    @property
    def is_self_closing(self) -> bool:
        return len(self.children) == 0
