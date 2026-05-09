import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Design System/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  argTypes: {
    variant:    { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    onDismiss:  { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Your session will expire in 10 minutes.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Changes saved',
    children: 'Your profile has been updated successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Storage almost full',
    children: 'You have used 90 % of your storage quota.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Something went wrong',
    children: 'Please try again or contact support if the problem persists.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    children: 'Click the × to dismiss this message.',
    dismissible: true,
  },
};
