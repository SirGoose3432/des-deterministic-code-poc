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

  const declRe = /^export const (\w+):\s*Story[^=]*=\s*\{/gm;
  let match: RegExpExecArray | null;

  while ((match = declRe.exec(source)) !== null) {
    const name = match[1];
    const bodyStart = match.index + match[0].length - 1;
    let depth = 0;
    let i = bodyStart;

    while (i < source.length) {
      const ch = source[i];
      if (ch === '{' || ch === '(') depth++;
      else if (ch === '}' || ch === ')') {
        depth--;
        if (depth === 0) break;
      } else if (ch === '`' || ch === '"' || ch === "'") {
        const quote = ch;
        i++;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') i++;
          i++;
        }
      }
      i++;
    }

    stories.set(name, source.slice(bodyStart, i + 1).trim());
  }

  return stories;
}

// ---------------------------------------------------------------------------
// Args → JSX rendering
// Converts a story's `args` object into the JSX snippet Canvas would show.
// Returns null for stories with custom render functions or complex arg values.
// ---------------------------------------------------------------------------

function storyToJsx(
  componentName: string,
  storyBody: string,
  schemaPropTypes: Record<string, string>,
): string | null {
  // Stories with a custom render function can't be trivially inlined.
  if (/\brender\s*:/.test(storyBody)) return null;

  // Locate the `args:` key and find its balanced brace span.
  const argsKeyMatch = storyBody.match(/\bargs\s*:\s*\{/);
  if (!argsKeyMatch) return null;

  const argsStart = (argsKeyMatch.index ?? 0) + argsKeyMatch[0].length - 1;
  let depth = 0;
  let i = argsStart;

  while (i < storyBody.length) {
    const ch = storyBody[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) break; }
    else if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch; i++;
      while (i < storyBody.length && storyBody[i] !== q) {
        if (storyBody[i] === '\\') i++;
        i++;
      }
    }
    i++;
  }

  const argsText = storyBody.slice(argsStart, i + 1);

  let args: Record<string, unknown>;
  try {
    // Safe eval — we own these source files and the args only contain primitives.
    args = new Function(`return (${argsText})`)() as Record<string, unknown>;
  } catch {
    return null;
  }

  // Render each arg as a JSX prop according to its schema type.
  const propParts: string[] = [];
  for (const [name, value] of Object.entries(args)) {
    if (value === null || value === undefined) continue;

    const schemaType = schemaPropTypes[name];

    if (typeof value === 'boolean') {
      propParts.push(value ? name : `${name}={false}`);
    } else if (schemaType === 'string' || schemaType === 'enum') {
      propParts.push(`${name}="${String(value).replace(/"/g, '\\"')}"`);
    } else if (typeof value === 'number') {
      propParts.push(`${name}={${value}}`);
    } else if (typeof value === 'string') {
      // Handler / expression prop passed as string (e.g. "handleClick")
      propParts.push(`${name}={${value}}`);
    } else {
      // Complex value (JSX node, object, array) — bail out gracefully.
      return null;
    }
  }

  if (propParts.length === 0) return `<${componentName} />`;

  // Inline if two props or fewer, multi-line otherwise.
  if (propParts.length <= 2) {
    return `<${componentName} ${propParts.join(' ')} />`;
  }
  return `<${componentName}\n${propParts.map((p) => `  ${p}`).join('\n')}\n/>`;
}

// ---------------------------------------------------------------------------
// MDX → Markdown transform
// ---------------------------------------------------------------------------

function transformMdx(
  mdxSource: string,
  componentName: string,
  propsTable: string,
  stories: Map<string, string>,
  schemaPropTypes: Record<string, string>,
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

    // <Canvas of={Stories.X} /> — replace with rendered JSX (or raw story as fallback)
    const canvasMatch = line.trim().match(/^<Canvas\s+of=\{[^.]+\.(\w+)\}\s*\/>/);
    if (canvasMatch) {
      const storyName = canvasMatch[1];
      const storyBody = stories.get(storyName);
      if (storyBody) {
        const jsx = storyToJsx(componentName, storyBody, schemaPropTypes);
        out.push('```tsx');
        out.push(jsx ?? `export const ${storyName}: Story = ${storyBody}`);
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

  // Build a name → type map for prop-aware JSX rendering
  const docs = parser.parse(componentPath);
  const schemaPropTypes: Record<string, string> = {};
  if (docs.length) {
    for (const [name, prop] of Object.entries(docs[0].props ?? {})) {
      schemaPropTypes[name] = prop.type.name;
    }
  }

  return transformMdx(mdxSource, componentName, propsTable, stories, schemaPropTypes);
}
