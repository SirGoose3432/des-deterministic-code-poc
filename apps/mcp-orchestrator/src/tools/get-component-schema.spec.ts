import { getComponentSchema } from './get-component-schema';

describe('getComponentSchema', () => {
  describe('Button', () => {
    const schema = getComponentSchema('Button');

    it('returns component name', () => {
      expect(schema.component).toBe('Button');
    });

    it('lists label in requiredProps', () => {
      expect(schema.requiredProps).toContain('label');
    });

    it('lists variant, size, disabled in optionalProps', () => {
      expect(schema.optionalProps).toEqual(
        expect.arrayContaining(['variant', 'size', 'disabled']),
      );
    });

    it('types label as string', () => {
      expect(schema.props['label'].type).toBe('string');
    });

    it('types variant as enum', () => {
      expect(schema.props['variant'].type).toBe('enum');
    });

    it('types disabled as boolean', () => {
      expect(schema.props['disabled'].type).toBe('boolean');
    });

    it('provides primary as the default for variant', () => {
      expect(schema.props['variant'].defaultValue).toBe('primary');
    });

    it('has no defaultValue for label', () => {
      expect(schema.props['label'].defaultValue).toBeNull();
    });

    it('marks label required: true', () => {
      expect(schema.props['label'].required).toBe(true);
    });

    it('marks variant required: false', () => {
      expect(schema.props['variant'].required).toBe(false);
    });

    it('includes a description for label', () => {
      expect(schema.props['label'].description).toBeTruthy();
    });
  });

  describe('TextInput', () => {
    const schema = getComponentSchema('TextInput');

    it('lists id, label, value, onChange as required', () => {
      expect(schema.requiredProps).toEqual(
        expect.arrayContaining(['id', 'label', 'value', 'onChange']),
      );
    });

    it('types onChange as a function signature', () => {
      expect(schema.props['onChange'].type).toContain('=>');
    });

    it('types disabled as boolean', () => {
      expect(schema.props['disabled'].type).toBe('boolean');
    });
  });

  describe('Modal', () => {
    const schema = getComponentSchema('Modal');

    it('lists isOpen, onClose, title, children as required', () => {
      expect(schema.requiredProps).toEqual(
        expect.arrayContaining(['isOpen', 'onClose', 'title', 'children']),
      );
    });

    it('types isOpen as boolean', () => {
      expect(schema.props['isOpen'].type).toBe('boolean');
    });

    it('provides md as the default for size', () => {
      expect(schema.props['size'].defaultValue).toBe('md');
    });
  });

  it('throws for an unknown component', () => {
    expect(() => getComponentSchema('Dropdown')).toThrow();
  });
});
