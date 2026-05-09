import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

const items = [
  { label: 'Home',     href: '/' },
  { label: 'Settings', href: '/settings' },
  { label: 'Profile' },
];

describe('Breadcrumb', () => {
  it('has a nav landmark with label', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders all crumb labels', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('marks the last item as current page', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Profile')).toHaveAttribute('aria-current', 'page');
  });

  it('renders non-last items with href as links', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('renders the separator between crumbs', () => {
    render(<Breadcrumb items={items} />);
    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);
  });

  it('renders a custom separator', () => {
    render(<Breadcrumb items={items} separator="›" />);
    expect(screen.getAllByText('›')).toHaveLength(2);
  });

  it('calls onClick when a button crumb is clicked', () => {
    const handler = vi.fn();
    render(
      <Breadcrumb
        items={[
          { label: 'Home', onClick: handler },
          { label: 'Current' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
