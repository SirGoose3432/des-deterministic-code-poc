import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a separator element', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders label text when provided', () => {
    render(<Divider label="or" />);
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('does not render label text when not provided', () => {
    render(<Divider />);
    expect(screen.queryByText('or')).not.toBeInTheDocument();
  });
});
