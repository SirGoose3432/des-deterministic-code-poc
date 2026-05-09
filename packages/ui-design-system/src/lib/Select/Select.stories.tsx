import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';

const options = [
  { value: 'design',      label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'product',     label: 'Product' },
];

const meta: Meta<typeof Select> = {
  title: 'Design System/Select',
  component: Select,
  parameters: { layout: 'padded' },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return (
      <Select
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        options={args.options ?? options}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    id: 'department',
    label: 'Department',
    value: '',
    options,
    placeholder: 'Select a department…',
  },
};

export const WithHint: Story = {
  args: {
    id: 'role',
    label: 'Role',
    value: 'design',
    options,
    hint: 'Choose the team this person belongs to.',
  },
};

export const WithError: Story = {
  args: {
    id: 'dept-error',
    label: 'Department',
    value: '',
    options,
    error: 'Please select a department.',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'dept-disabled',
    label: 'Department',
    value: 'engineering',
    options,
    disabled: true,
  },
};
