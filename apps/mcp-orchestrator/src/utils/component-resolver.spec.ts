import fs from 'fs';
import { resolveComponent, AVAILABLE_COMPONENTS } from './component-resolver';

describe('AVAILABLE_COMPONENTS', () => {
  it('includes Button, TextInput and Modal', () => {
    expect(AVAILABLE_COMPONENTS).toEqual(
      expect.arrayContaining(['Button', 'TextInput', 'Modal']),
    );
  });
});

describe('resolveComponent', () => {
  it.each(['Button', 'TextInput', 'Modal'])(
    '%s — componentPath exists on disk',
    (name) => {
      const { componentPath } = resolveComponent(name);
      expect(fs.existsSync(componentPath)).toBe(true);
    },
  );

  it.each(['Button', 'TextInput', 'Modal'])(
    '%s — storiesPath exists on disk',
    (name) => {
      const { storiesPath } = resolveComponent(name);
      expect(storiesPath).not.toBeNull();
      expect(fs.existsSync(storiesPath!)).toBe(true);
    },
  );

  it.each(['Button', 'TextInput', 'Modal'])(
    '%s — mdxPath exists on disk',
    (name) => {
      const { mdxPath } = resolveComponent(name);
      expect(mdxPath).not.toBeNull();
      expect(fs.existsSync(mdxPath!)).toBe(true);
    },
  );

  it('throws for an unknown component', () => {
    expect(() => resolveComponent('Dropdown')).toThrow('Unknown component');
  });

  it('includes the unknown name in the error message', () => {
    expect(() => resolveComponent('Dropdown')).toThrow('Dropdown');
  });
});
