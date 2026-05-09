import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello card</Card>);
    expect(screen.getByText('Hello card')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    render(<Card title="My card">body</Card>);
    expect(screen.getByText('My card')).toBeInTheDocument();
  });

  it('does not render a header when title is omitted', () => {
    render(<Card>body</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders fullWidth without crashing', () => {
    render(<Card fullWidth>body</Card>);
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
