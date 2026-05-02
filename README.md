# DES — Deterministic Code Generation PoC

A proof-of-concept for **LLM-free, deterministic React component generation** from a shared design system.

The idea: an MCP server exposes machine-readable schemas for every component in the design system. A Python engine consumes those schemas and produces valid, formatted TSX — no model guessing required.

---

## Workspace layout

```
des-deterministic-code-poc/
├── packages/
│   └── ui-design-system/       # React component library + Storybook
├── apps/
│   ├── mcp-orchestrator/       # MCP server (stdio transport)
│   └── web-consumer/           # Sample React SPA
└── python-ast-engine/          # Deterministic TSX generator (Python)
```

This is an [Nx 22.7](https://nx.dev) monorepo managed with Yarn workspaces.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Yarn Classic | 1.22+ |
| Python | 3.11+ |

Install JS dependencies from the repo root:

```bash
yarn install
```

---

## Running things

### Storybook (component explorer)

```bash
yarn start:storybook
# → http://localhost:6006
```

### Web consumer SPA

```bash
yarn start:web
# → http://localhost:4200
```

### MCP server

```bash
yarn start:mcp
# Listens on stdio — connect via an MCP client or the inspector below
```

### MCP inspector (interactive testing)

```bash
yarn inspect:mcp
```

---

## Building

```bash
yarn build           # all projects
yarn build:web       # web-consumer only
yarn build:mcp       # mcp-orchestrator only
yarn build:storybook # static Storybook site
```

---

## Testing

```bash
yarn test            # all JS/TS projects via Nx
yarn test:python     # Python AST engine (installs deps automatically)
```

---

## Projects

### `packages/ui-design-system`

A React 19 component library with three components:

| Component | Description |
|-----------|-------------|
| `Button` | Base action primitive with variant, size, loading, and disabled states |
| `TextInput` | Controlled form input with label, error, hint, and accessibility attributes |
| `Modal` | Portal-based overlay with backdrop dismiss, Escape key handling, and scroll lock |

Each component is fully typed with a TypeScript `Props` interface, styled with CSS Modules, and documented with Storybook stories.

**Exports** via `packages/ui-design-system/src/index.ts` — importable as `ui-design-system` or `@des/ui-design-system` within the workspace.

### `apps/mcp-orchestrator`

A [Model Context Protocol](https://modelcontextprotocol.io) server using `@modelcontextprotocol/sdk` over stdio transport. It exposes two tools:

#### `get_storybook_docs`

Returns human-readable Markdown documentation for a component, derived from its TypeScript prop types via `react-docgen-typescript`.

```json
{ "component": "Button" }
```

#### `get_component_ast_schema`

Returns a structured JSON schema describing a component's props — types, defaults, required/optional classification, and raw TypeScript type strings for inline enums.

```json
{ "component": "Button" }
```

Example output:

```json
{
  "component": "Button",
  "displayName": "Button",
  "props": {
    "label":   { "type": "string", "required": true,  "defaultValue": null },
    "variant": { "type": "enum",   "required": false, "defaultValue": "primary", "rawType": "ButtonVariant" },
    "disabled":{ "type": "boolean","required": false, "defaultValue": false }
  },
  "requiredProps": ["label"],
  "optionalProps": ["variant", "size", "disabled", "loading", "fullWidth", "type", "onClick"]
}
```

This schema is the input contract for the Python AST engine.

### `apps/web-consumer`

A Vite-powered React SPA that consumes the design system. Used to validate that the library builds and renders correctly in a real application context.

### `python-ast-engine`

A pure-Python (stdlib only, no runtime dependencies) engine that takes a component schema from `get_component_ast_schema` and a props dict, and returns deterministic, formatted TSX.

See [python-ast-engine/README.md](python-ast-engine/README.md) for full documentation.

**Quick usage:**

```bash
cd python-ast-engine

# JSX snippet
python generate.py \
  --schema _test_button.json \
  --props '{"label":"Submit","variant":"primary","disabled":false}'

# Output:
# <Button
#   label="Submit"
#   variant="primary"
#   disabled={false}
# />

# Full React component
python generate.py \
  --schema _test_button.json \
  --props '{"label":"Submit"}' \
  --mode component \
  --name SubmitButton

# Output:
# import { Button } from 'ui-design-system';
#
# export default function SubmitButton(): JSX.Element {
#   return (
#     <Button label="Submit" />
#   );
# }
```

---

## How the pipeline works

```
Design system source (*.tsx)
        │
        ▼
  mcp-orchestrator
  get_component_ast_schema
        │  JSON schema
        ▼
  python-ast-engine
  generate(schema, props)
        │  TSX string
        ▼
  Valid React component code
```

1. `react-docgen-typescript` parses the component source and extracts the Props interface.
2. The MCP server normalises this into a stable JSON schema (types, defaults, required/optional lists).
3. The Python engine validates the caller's props against the schema, builds an in-memory JSX AST, and serialises it to a formatted TSX string.

The output is fully deterministic: identical inputs always produce identical output, with no LLM involved.

---

## Prop rendering rules

| Schema type | Python value | TSX output |
|-------------|-------------|------------|
| `string` / `enum` | `"primary"` | `variant="primary"` |
| `boolean` | `True` | `disabled` (shorthand) |
| `boolean` | `False` | `disabled={false}` |
| `boolean` | `"isOpen"` | `isOpen={isOpen}` (JS variable) |
| function / handler | `"handleClick"` | `onClick={handleClick}` |
| function / handler | `"() => reset()"` | `onClick={() => reset()}` |
| `number` | `42` | `count={42}` |
