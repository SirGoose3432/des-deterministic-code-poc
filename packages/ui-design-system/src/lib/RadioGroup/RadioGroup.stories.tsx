import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioGroup } from './RadioGroup';

const planOptions = [
  { value: 'free',  label: 'Free — up to 3 projects' },
  { value: 'pro',   label: 'Pro — unlimited projects' },
  { value: 'team',  label: 'Team — collaboration features' },
];

const meta: Meta<typeof RadioGroup> = {
  title: 'Design System/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return (
      <RadioGroup
        {...args}
        value={value}
        onChange={setValue}
        options={args.options ?? planOptions}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Vertical: Story = {
  args: {
    name: 'plan',
    legend: 'Billing plan',
    value: 'free',
    options: planOptions,
  },
};

export const Horizontal: Story = {
  args: {
    name: 'size',
    legend: 'T-shirt size',
    value: 'md',
    orientation: 'horizontal',
    options: [
      { value: 'sm', label: 'S' },
      { value: 'md', label: 'M' },
      { value: 'lg', label: 'L' },
      { value: 'xl', label: 'XL' },
    ],
  },
};

export const WithError: Story = {
  args: {
    name: 'plan-error',
    legend: 'Billing plan',
    value: '',
    options: planOptions,
    error: 'Please select a plan to continue.',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'plan-disabled',
    legend: 'Billing plan',
    value: 'free',
    options: planOptions,
    disabled: true,
  },
};
