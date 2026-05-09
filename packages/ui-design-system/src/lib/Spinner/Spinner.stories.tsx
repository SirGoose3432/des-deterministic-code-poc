import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Design System/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = { args: {} };
export const Small: Story   = { args: { size: 'sm' } };
export const Large: Story   = { args: { size: 'lg' } };
export const CustomLabel: Story = {
  args: { size: 'md', label: 'Uploading file…' },
};
