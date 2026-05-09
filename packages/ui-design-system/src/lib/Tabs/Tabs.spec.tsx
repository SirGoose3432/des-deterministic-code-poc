import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'a', label: 'Tab A' },
  { id: 'b', label: 'Tab B' },
  { id: 'c', label: 'Tab C', disabled: true },
];

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} activeTab="a" onChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('marks the active tab with aria-selected="true"', () => {
    render(<Tabs tabs={tabs} activeTab="b" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onChange with the tab id when clicked', () => {
    const handler = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onChange={handler} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(handler).toHaveBeenCalledWith('b');
  });

  it('disables a specific tab', () => {
    render(<Tabs tabs={tabs} activeTab="a" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Tab C' })).toBeDisabled();
  });

  it('does not call onChange for a disabled tab', () => {
    const handler = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onChange={handler} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab C' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('has role="tablist" on the container', () => {
    render(<Tabs tabs={tabs} activeTab="a" onChange={() => {}} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
