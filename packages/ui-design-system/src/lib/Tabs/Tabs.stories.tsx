import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'overview',  label: 'Overview' },
  { id: 'activity',  label: 'Activity' },
  { id: 'settings',  label: 'Settings' },
  { id: 'disabled',  label: 'Disabled', disabled: true },
];

const meta: Meta<typeof Tabs> = {
  title: 'Design System/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
  render: (args) => {
    const [active, setActive] = useState(args.activeTab ?? 'overview');
    return (
      <Tabs
        {...args}
        tabs={args.tabs ?? tabs}
        activeTab={active}
        onChange={setActive}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: { tabs, activeTab: 'overview' },
};

export const Small: Story = {
  args: { tabs, activeTab: 'overview', size: 'sm' },
};
