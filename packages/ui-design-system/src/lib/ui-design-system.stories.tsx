import type { Meta, StoryObj } from '@storybook/react';
import { UiDesignSystem } from './ui-design-system';

const meta: Meta<typeof UiDesignSystem> = {
  title: 'Design System/UiDesignSystem',
  component: UiDesignSystem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UiDesignSystem>;

export const Default: Story = {};
