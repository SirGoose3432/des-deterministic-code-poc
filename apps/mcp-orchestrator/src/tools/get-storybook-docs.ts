import fs from 'fs';
import * as docgen from 'react-docgen-typescript';
import { resolveComponent, DESIGN_SYSTEM_TSCONFIG, AVAILABLE_COMPONENTS } from '../utils/component-resolver';

const parser = docgen.withCustomConfig(DESIGN_SYSTEM_TSCONFIG, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // Strip inherited HTML/React DOM props — keep only what's declared in the component's own interface.
  propFilter: (prop) =>
    prop.parent == null || !prop.parent.fileName.includes('node_modules'),
});

// react-docgen-typescript occasionally returns non-string values (e.g. arrays for enum unions).
function escapeCell(s: unknown): string {
  const str = Array.isArray(s)
    ? (s as Array<{ value: unknown }>).map((v) => v.value ?? v).join(' | ')
    : String(s ?? '');
  return str.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function getStorybookDocs(componentName: string): string {
  const { componentPath, storiesPath } = resolveComponent(componentName);

  const docs = parser.parse(componentPath);
  if (!docs.length) {
    throw new Error(`react-docgen-typescript found no exported component in: ${componentPath}`);
  }

  const doc = docs[0];

  let md = `# ${componentName}\n\n`;

  if (doc.description) {
    md += `${doc.description}\n\n`;
  }

  md += `**Source:** \`${componentPath}\`\n\n`;
  md += `**Available components:** ${AVAILABLE_COMPONENTS.join(', ')}\n\n`;

  // Props table
  const props = Object.entries(doc.props ?? {});
  if (props.length) {
    md += `## Props\n\n`;
    md += `| Prop | Type | Required | Default | Description |\n`;
    md += `|------|------|:--------:|---------|-------------|\n`;

    for (const [name, prop] of props) {
      const type = escapeCell(prop.type.name);
      const required = prop.required ? '✓' : '—';
      const defaultVal = prop.defaultValue != null ? `\`${escapeCell(prop.defaultValue.value)}\`` : '—';
      const description = escapeCell(prop.description || '—');
      md += `| \`${name}\` | \`${type}\` | ${required} | ${defaultVal} | ${description} |\n`;
    }
    md += '\n';
  } else {
    md += `_No props documented._\n\n`;
  }

  // Stories section
  if (storiesPath) {
    const source = fs.readFileSync(storiesPath, 'utf-8');
    const storyNames = [...source.matchAll(/^export const (\w+): Story/gm)].map((m) => m[1]);
    if (storyNames.length) {
      md += `## Storybook Stories\n\n`;
      storyNames.forEach((name) => (md += `- \`${name}\`\n`));
      md += '\n';
    }
  }

  return md;
}
