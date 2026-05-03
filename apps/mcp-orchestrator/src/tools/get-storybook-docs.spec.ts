import { getStorybookDocs } from './get-storybook-docs';

describe('getStorybookDocs', () => {
  describe('Button', () => {
    let docs: string;
    beforeAll(() => { docs = getStorybookDocs('Button'); });

    it('opens with the component heading', () => {
      expect(docs).toMatch(/^# Button/);
    });

    it('contains a props table header row', () => {
      expect(docs).toContain('| Prop |');
      expect(docs).toContain('| Type |');
    });

    it('includes the label row marked as required', () => {
      const labelRow = docs.split('\n').find((l) => l.includes('`label`'));
      expect(labelRow).toBeDefined();
      expect(labelRow).toContain('✓');
    });

    it('includes the variant row with its default', () => {
      const variantRow = docs.split('\n').find((l) => l.includes('`variant`'));
      expect(variantRow).toBeDefined();
      expect(variantRow).toContain('primary');
    });

    it('contains a tsx usage code block', () => {
      expect(docs).toContain('```tsx');
    });

    it('renders Primary story as JSX', () => {
      expect(docs).toContain('<Button label="Primary button"');
    });

    it('renders Disabled story as JSX with boolean shorthand', () => {
      expect(docs).toContain('<Button label="Not available" disabled />');
    });

    it('includes MDX prose descriptions', () => {
      expect(docs).toContain('default variant for primary actions');
    });
  });

  describe('TextInput', () => {
    let docs: string;
    beforeAll(() => { docs = getStorybookDocs('TextInput'); });

    it('opens with the component heading', () => {
      expect(docs).toMatch(/^# TextInput/);
    });

    it('includes the controlled-component callout', () => {
      expect(docs).toContain('controlled component');
    });

    it('contains story source for WithError', () => {
      expect(docs).toContain("export const WithError: Story =");
    });
  });

  describe('Modal', () => {
    let docs: string;
    beforeAll(() => { docs = getStorybookDocs('Modal'); });

    it('opens with the component heading', () => {
      expect(docs).toMatch(/^# Modal/);
    });

    it('includes the Accessibility section', () => {
      expect(docs).toContain('## Accessibility');
    });

    it('contains story source for NoBackdropClose', () => {
      expect(docs).toContain("export const NoBackdropClose: Story =");
    });
  });

  it('throws for an unknown component', () => {
    expect(() => getStorybookDocs('Dropdown')).toThrow();
  });
});
