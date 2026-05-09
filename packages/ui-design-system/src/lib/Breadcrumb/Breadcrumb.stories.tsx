import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const items = [
  { label: 'Home',     href: '/' },
  { label: 'Settings', href: '/settings' },
  { label: 'Profile' },
];

const meta: Meta<typeof Breadcrumb> = {
  title: 'Design System/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: { items },
};

export const CustomSeparator: Story = {
  args: { items, separator: '›' },
};

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/' },
      { label: 'Reports' },
    ],
  },
};
