import { spawnSync } from 'child_process';
import path from 'path';
import { getComponentSchema } from './get-component-schema';
import { WORKSPACE_ROOT } from '../utils/component-resolver';

const PYTHON_ENGINE_DIR = path.join(WORKSPACE_ROOT, 'python-react-engine');
const PYTHON_SCRIPT    = path.join(PYTHON_ENGINE_DIR, 'generate.py');

export type GenerateMode = 'jsx' | 'component';

export interface GenerateReactComponentOptions {
  /** Props to apply to the component. Only pass props you explicitly want to set. */
  props: Record<string, unknown>;
  /** Text children (e.g. for Modal body content). */
  children?: string;
  /**
   * Output mode:
   *   'jsx'       — returns a single self-contained JSX element (default)
   *   'component' — wraps the element in a full React function component with import
   */
  mode?: GenerateMode;
  /** Name for the generated wrapper function (component mode only). */
  componentName?: string;
}

export function getReactComponentFromSchema(
  componentName: string,
  options: GenerateReactComponentOptions,
): string {
  // Fetch the schema from the design system source so the Python engine
  // can validate prop types and produce deterministic output.
  const schema = getComponentSchema(componentName);

  const args: string[] = [
    PYTHON_SCRIPT,
    '--props', JSON.stringify(options.props),
  ];

  if (options.children) {
    args.push('--children', options.children);
  }
  if (options.mode === 'component') {
    args.push('--mode', 'component');
  }
  if (options.componentName) {
    args.push('--name', options.componentName);
  }

  const result = spawnSync('python', args, {
    // Pipe the schema JSON on stdin — avoids shell quoting issues with large JSON.
    input: JSON.stringify(schema),
    encoding: 'utf-8',
    cwd: PYTHON_ENGINE_DIR,
  });

  if (result.error) {
    throw new Error(
      `Failed to spawn python engine: ${result.error.message}. ` +
      `Make sure Python 3.11+ is on PATH and ${PYTHON_ENGINE_DIR} exists.`,
    );
  }

  if (result.status !== 0) {
    const detail = result.stderr?.trim() || 'no stderr output';
    throw new Error(
      `Python engine exited with code ${result.status}: ${detail}`,
    );
  }

  return result.stdout.trim();
}
