import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'success', 'warning', 'error', 'info'] },
    size:    { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story   = { args: { label: 'Default' } };
export const Primary: Story   = { args: { label: 'Primary', variant: 'primary' } };
export const Success: Story   = { args: { label: 'Active',  variant: 'success' } };
export const Warning: Story   = { args: { label: 'Pending', variant: 'warning' } };
export const Error: Story     = { args: { label: 'Failed',  variant: 'error' } };
export const Info: Story      = { args: { label: 'Draft',   variant: 'info' } };
export const Small: Story     = { args: { label: 'Small',   size: 'sm' } };
export const WithDot: Story   = { args: { label: 'Online',  variant: 'success', dot: true } };
