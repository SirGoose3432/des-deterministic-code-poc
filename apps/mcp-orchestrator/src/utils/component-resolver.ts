import path from 'path';
import fs from 'fs';

// Locate the workspace root by walking up from __dirname until we find nx.json.
// This handles both the compiled bundle (__dirname = dist/apps/mcp-orchestrator)
// and ts-jest test execution (__dirname = apps/mcp-orchestrator/src/utils).
function findWorkspaceRoot(): string {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'nx.json'))) return dir;
    dir = path.dirname(dir);
  }
  // Last resort: cwd is the workspace root when nx runs tests.
  return process.cwd();
}

export const WORKSPACE_ROOT = findWorkspaceRoot();

export const DESIGN_SYSTEM_TSCONFIG = path.join(
  WORKSPACE_ROOT,
  'packages/ui-design-system/tsconfig.json',
);

const COMPONENT_MAP: Record<string, string> = {
  Button:    'packages/ui-design-system/src/lib/Button/Button.tsx',
  TextInput: 'packages/ui-design-system/src/lib/TextInput/TextInput.tsx',
  Modal:     'packages/ui-design-system/src/lib/Modal/Modal.tsx',
};

export const AVAILABLE_COMPONENTS = Object.keys(COMPONENT_MAP);

export interface ResolvedComponent {
  componentPath: string;
  storiesPath: string | null;
  mdxPath: string | null;
}

export function resolveComponent(name: string): ResolvedComponent {
  const rel = COMPONENT_MAP[name];
  if (!rel) {
    throw new Error(
      `Unknown component "${name}". Available: ${AVAILABLE_COMPONENTS.join(', ')}`,
    );
  }

  const componentPath = path.join(WORKSPACE_ROOT, rel);
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component source not found at: ${componentPath}`);
  }

  const storiesPath = componentPath.replace('.tsx', '.stories.tsx');
  const mdxPath = componentPath.replace('.tsx', '.mdx');
  return {
    componentPath,
    storiesPath: fs.existsSync(storiesPath) ? storiesPath : null,
    mdxPath: fs.existsSync(mdxPath) ? mdxPath : null,
  };
}
