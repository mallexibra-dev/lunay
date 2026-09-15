import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

describe('Form primitives', () => {
  it('accepts typed text', async () => {
    render(<Input placeholder='Nama lengkap' />);

    const input = screen.getByPlaceholderText('Nama lengkap');
    await userEvent.type(input, 'Budi Santoso');

    expect(input).toHaveValue('Budi Santoso');
  });

  it('associates a label with its input via htmlFor', () => {
    render(
      <>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' type='email' />
      </>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders a disabled input', () => {
    render(<Input disabled placeholder='Nonaktif' />);

    expect(screen.getByPlaceholderText('Nonaktif')).toBeDisabled();
  });
});
