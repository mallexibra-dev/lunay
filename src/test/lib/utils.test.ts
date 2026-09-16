import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';
import { formatDateShort, formatDateTime } from '@/utils/formatter';

describe('cn', () => {
  it('joins conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('resolves conflicting tailwind classes, keeping the last', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatter', () => {
  const date = new Date('2026-09-15T10:30:00');

  it('formats a short date', () => {
    expect(formatDateShort(date)).toBe('Sep 15, 2026');
  });

  it('formats date and time', () => {
    expect(formatDateTime(date)).toBe('Sep 15, 2026, 10:30 AM');
  });
});
