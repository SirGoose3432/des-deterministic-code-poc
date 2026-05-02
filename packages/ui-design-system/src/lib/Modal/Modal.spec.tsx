import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Confirm action',
  children: 'Are you sure?',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Modal', () => {
  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      render(<Modal {...baseProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders the dialog when isOpen is true', () => {
      render(<Modal {...baseProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('renders the title', () => {
      render(<Modal {...baseProps} />);
      expect(screen.getByText('Confirm action')).toBeInTheDocument();
    });

    it('renders the children', () => {
      render(<Modal {...baseProps} />);
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('sets aria-modal="true" on the dialog', () => {
      render(<Modal {...baseProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('links the dialog to the title via aria-labelledby', () => {
      render(<Modal {...baseProps} />);
      const dialog = screen.getByRole('dialog');
      const labelId = dialog.getAttribute('aria-labelledby');
      expect(document.getElementById(labelId!)).toHaveTextContent('Confirm action');
    });
  });

  describe('close button', () => {
    it('renders the close button by default', () => {
      render(<Modal {...baseProps} />);
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
      render(<Modal {...baseProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not render the close button when showCloseButton={false}', () => {
      render(<Modal {...baseProps} showCloseButton={false} />);
      expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
    });
  });

  describe('backdrop', () => {
    it('calls onClose when the backdrop is clicked', () => {
      render(<Modal {...baseProps} />);
      // The backdrop is the outermost presentation div wrapping the panel.
      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when the panel itself is clicked', () => {
      render(<Modal {...baseProps} />);
      fireEvent.click(screen.getByRole('dialog'));
      expect(baseProps.onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose on backdrop click when closeOnBackdropClick={false}', () => {
      render(<Modal {...baseProps} closeOnBackdropClick={false} />);
      fireEvent.click(screen.getByRole('presentation'));
      expect(baseProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    it('calls onClose when Escape is pressed', () => {
      render(<Modal {...baseProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for other keys', () => {
      render(<Modal {...baseProps} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(baseProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('scroll lock', () => {
    it('sets overflow:hidden on body when open', () => {
      render(<Modal {...baseProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow when closed', () => {
      const { rerender } = render(<Modal {...baseProps} />);
      rerender(<Modal {...baseProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
