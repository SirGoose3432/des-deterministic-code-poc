import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Design System/Divider',
  component: Divider,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    spacing:     { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: { orientation: 'horizontal', spacing: 'md' },
};

export const WithLabel: Story = {
  args: { orientation: 'horizontal', label: 'or continue with', spacing: 'md' },
};

export const SpacingSmall: Story = {
  args: { spacing: 'sm' },
};

export const SpacingLarge: Story = {
  args: { spacing: 'lg' },
};
