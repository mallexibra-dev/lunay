'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, Minus, Plus } from 'lucide-react';
import { LunayWordmark } from '@/components/shared/lunay-logo';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { formatLong, todayISO } from '@/lib/cycle/date';

const STEPS = ['Selamat datang', 'Siklusmu', 'Haid terakhir'] as const;

const Stepper = ({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <div className='flex items-center justify-between rounded-2xl border-2 border-border bg-card px-4 py-3.5'>
    <span className='text-sm font-medium text-foreground'>
      {value} hari
    </span>
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label='Kurangi'
        className='grid size-9 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40'
      >
        <Minus className='size-4' />
      </button>
      <button
        type='button'
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label='Tambah'
        className='grid size-9 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40'
      >
        <Plus className='size-4' />
      </button>
    </div>
  </div>
);

export default function OnboardingPage() {
  const { data, hydrated, updateSettings, startPeriod } = useCycleStore();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastStart, setLastStart] = useState(todayISO());

  useEffect(() => {
    if (hydrated && data.settings.onboarded) {
      router.replace('/');
    }
  }, [hydrated, data.settings.onboarded, router]);

  if (!hydrated || data.settings.onboarded) {
    return (
      <div className='app-theme grid min-h-dvh place-items-center bg-background text-foreground'>
        <span className='text-sm text-muted-foreground'>Memuat…</span>
      </div>
    );
  }

  const finish = (startOverride?: string) => {
    const start = startOverride !== undefined ? startOverride : lastStart;
    updateSettings({
      displayName: name.trim(),
      defaultCycleLength: cycleLength,
      defaultPeriodLength: periodLength,
      onboarded: true,
    });
    if (start) startPeriod(start);
    router.replace('/');
  };

  return (
    <div className='app-theme flex min-h-dvh flex-col bg-background px-6 text-foreground'>
      {/* Progress */}
      <div className='mx-auto flex w-full max-w-md items-center gap-3 pt-8'>
        {step > 0 && (
          <button
            type='button'
            onClick={() => setStep((s) => s - 1)}
            aria-label='Kembali'
            className='grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary'
          >
            <ChevronLeft className='size-5' />
          </button>
        )}
        <div className='flex flex-1 gap-1.5'>
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={
                i <= step
                  ? 'h-1.5 flex-1 rounded-full bg-primary'
                  : 'h-1.5 flex-1 rounded-full bg-muted'
              }
            />
          ))}
        </div>
      </div>

      <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10'>
        {step === 0 && (
          <div>
            <LunayWordmark className='mb-8' />
            <h1 className='font-display text-[2rem] leading-tight font-semibold tracking-tight'>
              Tubuhmu punya ritme.
              <br />
              Lunay membantumu membacanya.
            </h1>
            <ul className='mt-6 flex flex-col gap-3'>
              {[
                'Tanpa akun & tanpa email — data hanya di perangkatmu',
                'Prediksi haid dan masa subur dari siklusmu sendiri',
                'Wawasan pola gejala yang bisa dibawa ke dokter',
              ].map((point) => (
                <li key={point} className='flex items-start gap-2.5 text-sm'>
                  <span className='mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-phase-ovulatory-soft text-phase-ovulatory'>
                    <Check className='size-3' />
                  </span>
                  <span className='text-muted-foreground'>{point}</span>
                </li>
              ))}
            </ul>
            <label className='mt-8 block text-sm font-medium text-foreground'>
              Siapa panggilanmu?{' '}
              <span className='font-normal text-muted-foreground'>(boleh dikosongkan)</span>
              <input
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                placeholder='Misal: Dinda'
                className='mt-2 h-12 w-full rounded-2xl border border-input bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className='flex flex-col gap-5'>
            <div>
              <h1 className='font-display text-[1.7rem] leading-tight font-semibold tracking-tight'>
                Berapa lama siklusmu biasanya?
              </h1>
              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                Dihitung dari hari pertama haid sampai hari pertama haid
                berikutnya. Rata-rata wanita: 28 hari. Lunay akan menyesuaikan
                dari catatan nyatamu.
              </p>
            </div>
            <Stepper
              value={cycleLength}
              min={20}
              max={45}
              onChange={setCycleLength}
            />
            <div>
              <h2 className='font-display text-[1.3rem] leading-tight font-semibold tracking-tight'>
                Berapa lama haidmu biasanya?
              </h2>
              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                Umumnya 4-5 hari. Bisa diubah kapan saja.
              </p>
            </div>
            <Stepper
              value={periodLength}
              min={2}
              max={10}
              onChange={setPeriodLength}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className='font-display text-[1.7rem] leading-tight font-semibold tracking-tight'>
              Kapan haid terakhirmu dimulai?
            </h1>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              Ini jadi titik awal peta siklusmu. Belum yakin? Lewati saja —
              prediksi mulai bekerja setelah catatan pertamamu.
            </p>
            <input
              type='date'
              value={lastStart}
              max={todayISO()}
              onChange={(e) => setLastStart(e.target.value)}
              className='mt-6 h-12 w-full rounded-2xl border border-input bg-card px-4 text-[15px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
            />
            {lastStart && (
              <p className='mt-2 text-xs text-muted-foreground'>
                {formatLong(lastStart)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Aksi */}
      <div className='mx-auto w-full max-w-md pb-10'>
        {step < 2 ? (
          <button
            type='button'
            onClick={() => setStep((s) => s + 1)}
            className='w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90'
          >
            Lanjut
          </button>
        ) : (
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => finish()}
              className='w-full rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            >
              Mulai dengan Lunay
            </button>
            <button
              type='button'
              onClick={() => finish('')}
              className='w-full py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              Lewati, nanti saya isi sendiri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
