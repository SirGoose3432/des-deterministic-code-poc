import fs from 'fs';
import * as docgen from 'react-docgen-typescript';
import { resolveComponent, DESIGN_SYSTEM_TSCONFIG, AVAILABLE_COMPONENTS } from '../utils/component-resolver';

const parser = docgen.withCustomConfig(DESIGN_SYSTEM_TSCONFIG, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) =>
    prop.parent == null || !prop.parent.fileName.includes('node_modules'),
});

function escapeCell(s: unknown): string {
  const str = Array.isArray(s)
    ? (s as Array<{ value: unknown }>).map((v) => v.value ?? v).join(' | ')
    : String(s ?? '');
  return str.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// ---------------------------------------------------------------------------
// Props table — generated from react-docgen-typescript
// ---------------------------------------------------------------------------

function buildPropsTable(componentPath: string): string {
  const docs = parser.parse(componentPath);
  if (!docs.length) return '_No props documented._\n';

  const props = Object.entries(docs[0].props ?? {});
  if (!props.length) return '_No props documented._\n';

  let table = `| Prop | Type | Required | Default | Description |\n`;
  table    += `|------|------|:--------:|---------|-------------|\n`;
  for (const [name, prop] of props) {
    const type       = escapeCell(prop.type.name);
    const required   = prop.required ? '✓' : '—';
    const defaultVal = prop.defaultValue != null ? `\`${escapeCell(prop.defaultValue.value)}\`` : '—';
    const description = escapeCell(prop.description || '—');
    table += `| \`${name}\` | \`${type}\` | ${required} | ${defaultVal} | ${description} |\n`;
  }
  return table;
}

// ---------------------------------------------------------------------------
// Story source extraction — pulls the args / render block for each story
// ---------------------------------------------------------------------------

function extractStories(storiesPath: string): Map<string, string> {
  const source = fs.readFileSync(storiesPath, 'utf-8');
  const stories = new Map<string, string>();

  // Match each top-level export const <Name>: Story = { ... };
  // We find the opening brace and walk forward to find the balanced closing.
  const declRe = /^export const (\w+):\s*Story[^=]*=\s*\{/gm;
  let match: RegExpExecArray | null;

  while ((match = declRe.exec(source)) !== null) {
    const name = match[1];
    const bodyStart = match.index + match[0].length - 1; // position of opening '{'
    let depth = 0;
    let i = bodyStart;

    // Walk to find the balanced closing brace, handling strings and template literals.
    while (i < source.length) {
      const ch = source[i];
      if (ch === '{' || ch === '(') depth++;
      else if (ch === '}' || ch === ')') {
        depth--;
        if (depth === 0) break;
      } else if (ch === '`' || ch === '"' || ch === "'") {
        // Skip string literal
        const quote = ch;
        i++;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') i++; // skip escaped char
          i++;
        }
      }
      i++;
    }

    const body = source.slice(bodyStart, i + 1).trim();
    stories.set(name, body);
  }

  return stories;
}

// ---------------------------------------------------------------------------
// MDX → Markdown transform
// ---------------------------------------------------------------------------

function transformMdx(
  mdxSource: string,
  componentName: string,
  propsTable: string,
  stories: Map<string, string>,
): string {
  const lines = mdxSource.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Drop import statements and blank lines that follow them at the top
    if (/^import\s+/.test(line)) { i++; continue; }

    // <Meta ... /> — drop
    if (/^<Meta\s/.test(line.trim())) { i++; continue; }

    // <Title /> — replace with # ComponentName
    if (/^<Title\s*\/>/.test(line.trim())) {
      out.push(`# ${componentName}`);
      i++;
      continue;
    }

    // <ArgTypes ... /> — replace with generated props table
    if (/^<ArgTypes\s/.test(line.trim())) {
      out.push(propsTable);
      i++;
      continue;
    }

    // <Canvas of={Stories.X} /> — replace with story source as a code block
    const canvasMatch = line.trim().match(/^<Canvas\s+of=\{[^.]+\.(\w+)\}\s*\/>/);
    if (canvasMatch) {
      const storyName = canvasMatch[1];
      const storyBody = stories.get(storyName);
      if (storyBody) {
        out.push('```tsx');
        out.push(`export const ${storyName}: Story = ${storyBody}`);
        out.push('```');
      }
      i++;
      continue;
    }

    out.push(line);
    i++;
  }

  // Collapse runs of more than two consecutive blank lines
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function getStorybookDocs(componentName: string): string {
  const { componentPath, mdxPath, storiesPath } = resolveComponent(componentName);

  if (!mdxPath) {
    throw new Error(
      `No MDX documentation found for "${componentName}". ` +
      `Available components: ${AVAILABLE_COMPONENTS.join(', ')}`,
    );
  }

  const mdxSource  = fs.readFileSync(mdxPath, 'utf-8');
  const propsTable = buildPropsTable(componentPath);
  const stories    = storiesPath ? extractStories(storiesPath) : new Map<string, string>();

  return transformMdx(mdxSource, componentName, propsTable, stories);
}
