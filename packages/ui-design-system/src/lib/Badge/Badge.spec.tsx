import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the label', () => {
    render(<Badge label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders a dot element when dot={true}', () => {
    const { container } = render(<Badge label="Online" dot />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('does not render a dot by default', () => {
    const { container } = render(<Badge label="Offline" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it('renders with a variant without crashing', () => {
    render(<Badge label="Error" variant="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders with sm size without crashing', () => {
    render(<Badge label="Small" size="sm" />);
    expect(screen.getByText('Small')).toBeInTheDocument();
  });
});
