import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Design System/Textarea',
  component: Textarea,
  parameters: { layout: 'padded' },
  argTypes: {
    resize: { control: 'select', options: ['none', 'vertical', 'both'] },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <Textarea {...args} value={value} onChange={setValue} />;
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    id: 'bio',
    label: 'Bio',
    value: '',
    placeholder: 'Tell us a little about yourself…',
  },
};

export const WithHint: Story = {
  args: {
    id: 'notes',
    label: 'Notes',
    value: '',
    hint: 'Internal notes are only visible to admins.',
  },
};

export const WithError: Story = {
  args: {
    id: 'desc',
    label: 'Description',
    value: '',
    error: 'Description is required.',
    required: true,
  },
};

export const WithCharacterCount: Story = {
  args: {
    id: 'tweet',
    label: 'Message',
    value: 'Hello world!',
    maxLength: 280,
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled',
    label: 'Reason',
    value: 'This field is currently locked.',
    disabled: true,
  },
};
