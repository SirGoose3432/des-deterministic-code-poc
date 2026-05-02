import path from 'path';
import fs from 'fs';

// When built, __dirname = dist/apps/mcp-orchestrator → 3 levels up = workspace root.
// When running via `nx serve`, cwd is workspace root; __dirname is still the dist location.
export const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..');

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
  return {
    componentPath,
    storiesPath: fs.existsSync(storiesPath) ? storiesPath : null,
  };
}
