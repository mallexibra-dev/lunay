'use client';

import { useEffect, useState } from 'react';
import { Delete, Fingerprint, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCycleStore } from '@/hooks/use-cycle-store';
import {
  hashPin,
  isBiometricAvailable,
  makeSalt,
  registerBiometric,
} from '@/lib/cycle/crypto';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionCard, SectionRow } from './section-card';
import { cn } from '@/lib/utils';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/** Keypad PIN kecil untuk dialog setup. */
const PinPad = ({
  entry,
  onDigit,
  onErase,
}: {
  entry: string;
  onDigit: (d: string) => void;
  onErase: () => void;
}) => (
  <div>
    <div className='mb-4 flex justify-center gap-3'>
      {Array.from({ length: Math.max(4, entry.length) }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'size-2.5 rounded-full border transition-colors',
            i < entry.length
              ? 'border-primary bg-primary'
              : 'border-border bg-transparent'
          )}
        />
      ))}
    </div>
    <div className='mx-auto grid max-w-[15rem] grid-cols-3 gap-x-5 gap-y-1'>
      {KEYS.map((key) => (
        <button
          key={key}
          type='button'
          onClick={() => onDigit(key)}
          className='app-figure grid h-12 place-items-center rounded-full text-xl text-foreground transition-colors hover:bg-secondary'
        >
          {key}
        </button>
      ))}
      <span />
      <button
        type='button'
        onClick={() => onDigit('0')}
        className='app-figure grid h-12 place-items-center rounded-full text-xl text-foreground transition-colors hover:bg-secondary'
      >
        0
      </button>
      <button
        type='button'
        onClick={onErase}
        aria-label='Hapus'
        className='grid h-12 place-items-center rounded-full text-muted-foreground hover:bg-secondary'
      >
        <Delete className='size-4' />
      </button>
    </div>
  </div>
);

/** Seksi keamanan: kunci PIN, biometrik, kunci sekarang. */
export const SecuritySection = () => {
  const { data, updateSettings, lock } = useCycleStore();
  const { pinHash, pinLength, biometricEnabled } = data.settings;

  const [setupOpen, setSetupOpen] = useState(false);
  const [stage, setStage] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    isBiometricAvailable().then((ok) => {
      if (active) setBioAvailable(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  const openSetup = () => {
    setStage('create');
    setFirstPin('');
    setEntry('');
    setError(false);
    setSetupOpen(true);
  };

  const press = (digit: string) => {
    if (error || entry.length >= 6) return;
    const next = entry + digit;
    setEntry(next);

    if (stage === 'create' && next.length === 4) {
      // PIN minimal 4 — tunggu sampai pengguna puas: selesai di 4-6 digit
      // dengan tombol lanjut agar fleksibel
      return;
    }
  };

  const advance = () => {
    if (entry.length < 4) {
      setError(true);
      setTimeout(() => setError(false), 400);
      return;
    }
    if (stage === 'create') {
      setFirstPin(entry);
      setEntry('');
      setStage('confirm');
      return;
    }
    if (entry !== firstPin) {
      setError(true);
      setEntry('');
      setTimeout(() => setError(false), 400);
      return;
    }
    void (async () => {
      const salt = makeSalt();
      const hash = await hashPin(entry, salt);
      updateSettings({
        pinHash: hash,
        pinSalt: salt,
        pinLength: entry.length,
      });
      toast.success('Kunci PIN aktif', {
        description: 'Aplikasi akan terkunci setiap kali dibuka.',
      });
      setSetupOpen(false);
    })();
  };

  const removePin = () => {
    updateSettings({
      pinHash: null,
      pinSalt: null,
      pinLength: null,
      biometricEnabled: false,
      biometricCredentialId: null,
    });
    toast('Kunci PIN dinonaktifkan');
  };

  const toggleBiometric = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ biometricEnabled: false, biometricCredentialId: null });
      return;
    }
    try {
      const credentialId = await registerBiometric();
      updateSettings({ biometricEnabled: true, biometricCredentialId: credentialId });
      toast.success('Buka kunci biometrik aktif');
    } catch {
      toast.error('Biometrik dibatalkan atau tidak tersedia');
    }
  };

  return (
    <SectionCard
      title='Keamanan'
      description='Lapisan privat untuk saat aplikasi dibuka orang lain.'
    >
      {pinHash ? (
        <>
          <SectionRow>
            <Lock className='size-4 shrink-0 text-primary' />
            <div className='min-w-0 flex-1'>
              <p className='text-[13px] font-medium text-foreground'>
                Kunci PIN aktif ({pinLength} digit)
              </p>
            </div>
            <button
              type='button'
              onClick={openSetup}
              className='text-[12px] font-semibold text-primary'
            >
              Ubah
            </button>
          </SectionRow>
          {bioAvailable && (
            <SectionRow>
              <Fingerprint className='size-4 shrink-0 text-primary' />
              <div className='min-w-0 flex-1'>
                <p className='text-[13px] font-medium text-foreground'>
                  Buka dengan sidik jari / Face ID
                </p>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={(checked) => void toggleBiometric(checked)}
                aria-label='Aktifkan buka kunci biometrik'
              />
            </SectionRow>
          )}
          <SectionRow>
            <div className='min-w-0 flex-1'>
              <p className='text-[13px] font-medium text-foreground'>
                Kunci sekarang
              </p>
            </div>
            <button
              type='button'
              onClick={lock}
              className='rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
            >
              Kunci
            </button>
          </SectionRow>
          <SectionRow>
            <div className='min-w-0 flex-1'>
              <p className='text-[13px] font-medium text-foreground'>
                Nonaktifkan kunci
              </p>
            </div>
            <button
              type='button'
              onClick={removePin}
              className='text-[12px] font-semibold text-destructive'
            >
              Matikan
            </button>
          </SectionRow>
        </>
      ) : (
        <SectionRow>
          <ShieldCheck className='size-4 shrink-0 text-primary' />
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>
              Kunci PIN belum aktif
            </p>
            <p className='text-[11px] text-muted-foreground'>
              Minta PIN 4-6 digit setiap aplikasi dibuka.
            </p>
          </div>
          <button
            type='button'
            onClick={openSetup}
            className='rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90'
          >
            Aktifkan
          </button>
        </SectionRow>
      )}

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className='app-theme max-w-[calc(100vw-2.5rem)] rounded-2xl bg-card sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='text-center text-foreground'>
              {stage === 'create' ? 'Buat PIN baru' : 'Konfirmasi PIN'}
            </DialogTitle>
          </DialogHeader>
          <div className={cn('pb-2', error && 'app-shake')}>
            <PinPad
              entry={entry}
              onDigit={press}
              onErase={() => setEntry((prev) => prev.slice(0, -1))}
            />
            <p
              className='mt-3 h-4 text-center text-xs text-destructive'
              aria-live='polite'
            >
              {error ? 'PIN minimal 4 digit / tidak cocok' : ''}
            </p>
            <button
              type='button'
              onClick={advance}
              className='mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            >
              {stage === 'create' ? 'Lanjut' : 'Simpan PIN'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
};
