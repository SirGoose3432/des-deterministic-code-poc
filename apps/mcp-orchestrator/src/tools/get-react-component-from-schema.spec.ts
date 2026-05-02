import { spawnSync } from 'child_process';
import { getReactComponentFromSchema } from './get-react-component-from-schema';

jest.mock('child_process');

const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

const SUCCESS = (stdout: string) =>
  ({ status: 0, stdout, stderr: '', pid: 1, output: [], signal: null } as any);

const FAILURE = (status: number, stderr: string) =>
  ({ status, stdout: '', stderr, pid: 1, output: [], signal: null } as any);

const SPAWN_ERROR = (message: string) =>
  ({ status: null, stdout: '', stderr: '', error: new Error(message), pid: 0, output: [], signal: null } as any);

describe('getReactComponentFromSchema', () => {
  beforeEach(() => {
    mockSpawnSync.mockReturnValue(SUCCESS('<Button label="Submit" />'));
  });

  afterEach(() => jest.clearAllMocks());

  // ---------------------------------------------------------------------------
  // Subprocess invocation
  // ---------------------------------------------------------------------------

  it('spawns python with the generate.py script', () => {
    getReactComponentFromSchema('Button', { props: { label: 'Submit' } });
    expect(mockSpawnSync).toHaveBeenCalledWith(
      'python',
      expect.arrayContaining([expect.stringContaining('generate.py')]),
      expect.objectContaining({ encoding: 'utf-8' }),
    );
  });

  it('passes --props as a serialised JSON string', () => {
    getReactComponentFromSchema('Button', { props: { label: 'Submit', variant: 'primary' } });
    const args = mockSpawnSync.mock.calls[0][1] as string[];
    const idx = args.indexOf('--props');
    expect(idx).toBeGreaterThan(-1);
    expect(JSON.parse(args[idx + 1])).toEqual({ label: 'Submit', variant: 'primary' });
  });

  it('pipes the component schema as stdin JSON', () => {
    getReactComponentFromSchema('Button', { props: { label: 'Submit' } });
    const opts = mockSpawnSync.mock.calls[0][2] as any;
    const schema = JSON.parse(opts.input);
    expect(schema.component).toBe('Button');
    expect(schema.requiredProps).toContain('label');
  });

  it('sets cwd to the python-react-engine directory', () => {
    getReactComponentFromSchema('Button', { props: { label: 'Submit' } });
    const opts = mockSpawnSync.mock.calls[0][2] as any;
    expect(opts.cwd).toContain('python-react-engine');
  });

  // ---------------------------------------------------------------------------
  // Optional arguments
  // ---------------------------------------------------------------------------

  it('includes --mode component when mode is "component"', () => {
    getReactComponentFromSchema('Button', { props: { label: 'X' }, mode: 'component' });
    const args = mockSpawnSync.mock.calls[0][1] as string[];
    expect(args).toContain('--mode');
    expect(args[args.indexOf('--mode') + 1]).toBe('component');
  });

  it('omits --mode when mode is "jsx" (default)', () => {
    getReactComponentFromSchema('Button', { props: { label: 'X' }, mode: 'jsx' });
    const args = mockSpawnSync.mock.calls[0][1] as string[];
    expect(args).not.toContain('--mode');
  });

  it('includes --name when componentName is supplied', () => {
    getReactComponentFromSchema('Button', { props: { label: 'X' }, mode: 'component', componentName: 'SaveButton' });
    const args = mockSpawnSync.mock.calls[0][1] as string[];
    expect(args).toContain('--name');
    expect(args[args.indexOf('--name') + 1]).toBe('SaveButton');
  });

  it('includes --children when children is supplied', () => {
    getReactComponentFromSchema('Modal', {
      props: { isOpen: 'open', onClose: 'close', title: 'Hi' },
      children: 'Body text',
    });
    const args = mockSpawnSync.mock.calls[0][1] as string[];
    expect(args).toContain('--children');
    expect(args[args.indexOf('--children') + 1]).toBe('Body text');
  });

  it('omits --children when not supplied', () => {
    getReactComponentFromSchema('Button', { props: { label: 'X' } });
    const args = mockSpawnSync.mock.calls[0][1] as string[];
    expect(args).not.toContain('--children');
  });

  // ---------------------------------------------------------------------------
  // Return value
  // ---------------------------------------------------------------------------

  it('returns trimmed stdout from the python process', () => {
    mockSpawnSync.mockReturnValue(SUCCESS('  <Button label="Submit" />\n'));
    const result = getReactComponentFromSchema('Button', { props: { label: 'Submit' } });
    expect(result).toBe('<Button label="Submit" />');
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  it('throws with a helpful message when python cannot be spawned', () => {
    mockSpawnSync.mockReturnValue(SPAWN_ERROR('python not found'));
    expect(() =>
      getReactComponentFromSchema('Button', { props: { label: 'X' } }),
    ).toThrow('Failed to spawn python engine');
  });

  it('throws including the stderr detail on non-zero exit', () => {
    mockSpawnSync.mockReturnValue(
      FAILURE(3, "validation error (prop: 'label'): Required prop 'label' is missing."),
    );
    expect(() =>
      getReactComponentFromSchema('Button', { props: {} }),
    ).toThrow("validation error (prop: 'label')");
  });

  it('includes the exit code in the error on non-zero exit', () => {
    mockSpawnSync.mockReturnValue(FAILURE(3, 'some error'));
    expect(() =>
      getReactComponentFromSchema('Button', { props: {} }),
    ).toThrow('code 3');
  });

  it('throws for an unknown component before even spawning python', () => {
    expect(() =>
      getReactComponentFromSchema('Dropdown', { props: {} }),
    ).toThrow('Dropdown');
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });
});
