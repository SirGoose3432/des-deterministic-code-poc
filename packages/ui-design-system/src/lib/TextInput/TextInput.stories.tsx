import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Design System/TextInput',
  component: TextInput,
  parameters: { layout: 'centered' },
  argTypes: {
    type:     { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
    onChange: { action: 'changed' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextInput>;

// Controlled wrapper so Storybook controls actually reflect state changes.
const Controlled = (args: React.ComponentProps<typeof TextInput>) => {
  const [value, setValue] = useState(args.value ?? '');
  return <TextInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    id: 'default',
    label: 'Full name',
    placeholder: 'Jane Doe',
  },
};

export const WithHint: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    id: 'email',
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    hint: "We'll never share your email with anyone.",
  },
};

export const WithError: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    id: 'username',
    label: 'Username',
    value: 'jn',
    error: 'Username must be at least 3 characters.',
  },
};

export const Required: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    id: 'disabled',
    label: 'Account number',
    value: 'ACC-00192',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    id: 'readonly',
    label: 'API key',
    value: 'sk-xxxxxxxxxxxxxxxx',
    readOnly: true,
    hint: "Copy this key — it won't be shown again.",
  },
};
