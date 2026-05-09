import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  parameters: { layout: 'padded' },
  argTypes: {
    padding:   { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    elevation: { control: 'select', options: ['none', 'sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'Card content goes here.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card title',
    children: 'Card body content with a title header.',
  },
};

export const ElevationMedium: Story = {
  args: {
    title: 'Elevated card',
    children: 'Higher shadow depth for modal-like surfaces.',
    elevation: 'md',
  },
};

export const ElevationNone: Story = {
  args: {
    title: 'Flat card',
    children: 'Border only, no shadow — useful inside already-elevated containers.',
    elevation: 'none',
  },
};

export const PaddingSmall: Story = {
  args: {
    title: 'Compact',
    children: 'Reduced padding for dense layouts.',
    padding: 'sm',
  },
};

export const PaddingLarge: Story = {
  args: {
    title: 'Spacious',
    children: 'Extra padding for hero or spotlight cards.',
    padding: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    title: 'Full-width card',
    children: 'Stretches to fill its container.',
    fullWidth: true,
  },
};
