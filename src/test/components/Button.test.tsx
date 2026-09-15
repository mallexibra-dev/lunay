import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Simpan</Button>);

    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Klik' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies the destructive variant styles', () => {
    render(<Button variant='destructive'>Hapus</Button>);

    expect(screen.getByRole('button', { name: 'Hapus' })).toHaveClass(
      'bg-destructive'
    );
  });

  it('can be disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Terkunci
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Terkunci' });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
