'use client';

import { useEffect, useState } from 'react';
import { Delete, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { LunayWordmark } from '@/components/shared/lunay-logo';
import { useCycleStore } from '@/hooks/use-cycle-store';
import {
  isBiometricAvailable,
  verifyBiometric,
  verifyPin,
} from '@/lib/cycle/crypto';
import { cn } from '@/lib/utils';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export const LockScreen = () => {
  const { data, unlock } = useCycleStore();
  const { pinLength, pinHash, pinSalt, biometricEnabled, biometricCredentialId } =
    data.settings;

  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);
  const [biometricReady, setBiometricReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (biometricEnabled && biometricCredentialId) {
      isBiometricAvailable().then((ok) => {
        if (active) setBiometricReady(ok);
      });
    }
    return () => {
      active = false;
    };
  }, [biometricEnabled, biometricCredentialId]);

  const targetLength = pinLength ?? 4;

  const submit = async (pin: string) => {
    if (!pinHash || !pinSalt) return;
    const ok = await verifyPin(pin, pinSalt, pinHash);
    if (ok) {
      unlock();
    } else {
      setError(true);
      setEntry('');
      setTimeout(() => setError(false), 450);
    }
  };

  const press = (digit: string) => {
    if (error || entry.length >= targetLength) return;
    const next = entry + digit;
    setEntry(next);
    if (next.length === targetLength) void submit(next);
  };

  const erase = () => setEntry((prev) => prev.slice(0, -1));

  const tryBiometric = async () => {
    if (!biometricCredentialId) return;
    try {
      await verifyBiometric(biometricCredentialId);
      unlock();
    } catch {
      toast('Verifikasi biometrik gagal', {
        description: 'Gunakan PIN untuk membuka.',
      });
    }
  };

  return (
    <div className='app-theme flex min-h-dvh flex-col items-center justify-center bg-background px-8 text-foreground'>
      <LunayWordmark className='mb-10' />

      <div className={cn('flex flex-col items-center', error && 'app-shake')}>
        <p className='text-sm text-muted-foreground'>Masukkan PIN-mu</p>
        <div className='mt-4 flex gap-3.5' aria-label='PIN terisi'>
          {Array.from({ length: targetLength }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'size-3 rounded-full border transition-colors',
                i < entry.length
                  ? 'border-primary bg-primary'
                  : 'border-border bg-transparent'
              )}
            />
          ))}
        </div>
        <p
          className='mt-3 h-5 text-xs text-destructive'
          aria-live='polite'
        >
          {error ? 'PIN salah, coba lagi' : ''}
        </p>
      </div>

      <div className='mt-4 grid w-full max-w-[17rem] grid-cols-3 gap-x-6 gap-y-2'>
        {KEYS.map((key) => (
          <button
            key={key}
            type='button'
            onClick={() => press(key)}
            className='app-figure grid h-16 place-items-center rounded-full text-2xl text-foreground transition-colors hover:bg-secondary active:bg-secondary'
          >
            {key}
          </button>
        ))}
        <span />
        <button
          type='button'
          onClick={() => press('0')}
          className='app-figure grid h-16 place-items-center rounded-full text-2xl text-foreground transition-colors hover:bg-secondary active:bg-secondary'
        >
          0
        </button>
        <button
          type='button'
          onClick={erase}
          aria-label='Hapus angka terakhir'
          className='grid h-16 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary'
        >
          <Delete className='size-5' />
        </button>
      </div>

      {biometricReady && (
        <button
          type='button'
          onClick={tryBiometric}
          className='mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary'
        >
          <Fingerprint className='size-4.5 text-primary' />
          Buka dengan sidik jari / Face ID
        </button>
      )}
    </div>
  );
};
