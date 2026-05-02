import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getStorybookDocs } from './tools/get-storybook-docs';
import { getComponentAstSchema } from './tools/get-component-ast-schema';
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
  'get_component_ast_schema',
  'Parses a ui-design-system component with react-docgen-typescript and returns a structured JSON schema: displayName, description, filePath, full props map (type, rawType, required, defaultValue, description), and separate requiredProps / optionalProps arrays. Intended for machine consumption by code generators and AI agents.',
  componentParam,
  async ({ component }) => {
    try {
      const schema = getComponentAstSchema(component);
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
