import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = {
  title: 'Design System/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Trigger-based wrapper so Storybook can open/close the modal interactively.
const WithTrigger = (args: React.ComponentProps<typeof Modal>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Open modal" onClick={() => setOpen(true)} />
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <WithTrigger {...args} />,
  args: {
    title: 'Confirm action',
    children: 'Are you sure you want to proceed? This action cannot be undone.',
    size: 'md',
  },
};

export const Small: Story = {
  render: (args) => <WithTrigger {...args} />,
  args: {
    title: 'Quick note',
    size: 'sm',
    children: 'This is a compact modal for short messages or confirmations.',
  },
};

export const Large: Story = {
  render: (args) => <WithTrigger {...args} />,
  args: {
    title: 'Terms & Conditions',
    size: 'lg',
    children: (
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    ),
  },
};

export const NoBackdropClose: Story = {
  render: (args) => <WithTrigger {...args} />,
  args: {
    title: 'Unsaved changes',
    children: 'You have unsaved changes. Please save or discard before leaving.',
    closeOnBackdropClick: false,
  },
};

export const NoCloseButton: Story = {
  render: (args) => <WithTrigger {...args} />,
  args: {
    title: 'Processing…',
    children: 'Please wait while we process your request.',
    showCloseButton: false,
    closeOnBackdropClick: false,
  },
};
