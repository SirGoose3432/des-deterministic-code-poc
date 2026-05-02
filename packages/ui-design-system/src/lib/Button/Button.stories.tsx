import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
    type:    { control: 'select', options: ['button', 'submit', 'reset'] },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { label: 'Primary button', variant: 'primary' },
};

export const Secondary: Story = {
  args: { label: 'Secondary button', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { label: 'Ghost button', variant: 'ghost' },
};

export const Danger: Story = {
  args: { label: 'Delete account', variant: 'danger' },
};

export const Small: Story = {
  args: { label: 'Small', size: 'sm' },
};

export const Large: Story = {
  args: { label: 'Large', size: 'lg' },
};

export const Loading: Story = {
  args: { label: 'Saving…', loading: true },
};

export const Disabled: Story = {
  args: { label: 'Not available', disabled: true },
};

export const FullWidth: Story = {
  args: { label: 'Confirm & continue', fullWidth: true },
  parameters: { layout: 'padded' },
};
