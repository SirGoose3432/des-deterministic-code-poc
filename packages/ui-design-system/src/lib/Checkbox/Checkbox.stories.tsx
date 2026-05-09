import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Design System/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    id: 'terms',
    label: 'I agree to the terms and conditions',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    id: 'checked',
    label: 'Receive marketing emails',
    checked: true,
  },
};

export const WithHint: Story = {
  args: {
    id: 'newsletter',
    label: 'Subscribe to newsletter',
    checked: false,
    hint: 'We send at most one email per week.',
  },
};

export const WithError: Story = {
  args: {
    id: 'terms-error',
    label: 'I agree to the terms and conditions',
    checked: false,
    error: 'You must accept the terms to continue.',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled',
    label: 'This option is unavailable',
    checked: false,
    disabled: true,
  },
};

export const Indeterminate: Story = {
  args: {
    id: 'indeterminate',
    label: 'Select all',
    checked: false,
    indeterminate: true,
  },
};
