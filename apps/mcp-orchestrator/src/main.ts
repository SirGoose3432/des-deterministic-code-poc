import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getStorybookDocs } from './tools/get-storybook-docs';
import { getComponentSchema } from './tools/get-component-schema';
import { getReactComponentFromSchema } from './tools/get-react-component-from-schema';
import { AVAILABLE_COMPONENTS } from './utils/component-resolver';

const server = new McpServer({
  name: 'design-system-mcp',
  version: '1.0.0',
});

const componentParam = {
  component: z
    .string()
    .describe(`Component name. Available: ${AVAILABLE_COMPONENTS.join(', ')}`),
};

server.tool(
  'get_storybook_docs',
  'Returns human-readable Markdown documentation for a ui-design-system component: prop table with types, defaults, required flags, JSDoc descriptions, and the list of available Storybook stories.',
  componentParam,
  async ({ component }) => {
    try {
      const text = getStorybookDocs(component);
      return { content: [{ type: 'text' as const, text }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  },
);

server.tool(
  'get_component_schema',
  'Parses a ui-design-system component with react-docgen-typescript and returns a structured JSON schema: displayName, description, filePath, full props map (type, rawType, required, defaultValue, description), and separate requiredProps / optionalProps arrays. Intended for machine consumption by code generators and AI agents.',
  componentParam,
  async ({ component }) => {
    try {
      const schema = getComponentSchema(component);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(schema, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  },
);

server.tool(
  'get_react_component_from_schema',
  [
    'Generates valid, formatted React TSX for a ui-design-system component.',
    'Fetches the component schema internally, validates the supplied props against it,',
    'then invokes the python-react-engine to produce deterministic output — no LLM guessing.',
    `Available components: ${AVAILABLE_COMPONENTS.join(', ')}.`,
    "Use mode='component' to wrap the element in a full React function component with import statement.",
  ].join(' '),
  {
    component: z
      .string()
      .describe(`Component to generate. Available: ${AVAILABLE_COMPONENTS.join(', ')}`),
    props: z
      .record(z.string(), z.unknown())
      .describe('Props to apply. Keys must match the component schema. Omit props you want left at their defaults.'),
    children: z
      .string()
      .optional()
      .describe('Text children to place inside the element (e.g. Modal body text).'),
    mode: z
      .enum(['jsx', 'component'])
      .optional()
      .describe("Output mode: 'jsx' returns a JSX element (default); 'component' wraps it in a full React function."),
    componentName: z
      .string()
      .optional()
      .describe('Name for the generated wrapper function (component mode only).'),
  },
  async ({ component, props, children, mode, componentName }) => {
    try {
      const tsx = getReactComponentFromSchema(component, {
        props: props as Record<string, unknown>,
        children,
        mode: mode as 'jsx' | 'component' | undefined,
        componentName,
      });
      return { content: [{ type: 'text' as const, text: tsx }] };
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Write to stderr so stdout stays clean for the MCP JSON-RPC stream.
  process.stderr.write('Design System MCP server listening on stdio\n');
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
