'use client';

import { useState } from 'react';
import { Bell, BellRing, Check, Minus, Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCycleStore } from '@/hooks/use-cycle-store';
import {
  notificationPermission,
  notificationSupported,
  requestNotificationPermission,
} from '@/lib/cycle/notifications';
import { SectionCard, SectionRow } from './_components/section-card';
import { ReminderManager } from './_components/reminder-manager';
import { SecuritySection } from './_components/security-section';
import { DataSection } from './_components/data-section';

const Stepper = ({
  value,
  min,
  max,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) => (
  <div className='flex items-center gap-3'>
    <button
      type='button'
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`Kurangi ${unit}`}
      className='grid size-8 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40'
    >
      <Minus className='size-3.5' />
    </button>
    <span className='app-figure w-14 text-center text-lg font-semibold text-foreground'>
      {value}
      <span className='ml-0.5 font-sans text-[10px] font-normal text-muted-foreground'>
        {unit}
      </span>
    </span>
    <button
      type='button'
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`Tambah ${unit}`}
      className='grid size-8 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40'
    >
      <Plus className='size-3.5' />
    </button>
  </div>
);

export default function SettingsPage() {
  const { data, updateSettings } = useCycleStore();
  const { settings } = data;
  const [name, setName] = useState(settings.displayName);

  const perm = notificationSupported()
    ? notificationPermission()
    : 'unsupported';

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    updateSettings({ notificationsEnabled: granted });
    if (granted) toast.success('Notifikasi diizinkan');
    else toast('Izin tidak diberikan', { description: 'Pengingat tetap tampil di dalam aplikasi.' });
  };

  return (
    <div className='flex flex-col gap-6'>
      <header>
        <h1 className='font-display text-2xl font-semibold tracking-tight text-foreground'>
          Profil & Pengaturan
        </h1>
      </header>

      {/* Privasi */}
      <SectionCard title='Privasi'>
        <SectionRow>
          <ShieldCheck className='size-4.5 shrink-0 text-phase-ovulatory' />
          <div className='min-w-0'>
            <p className='text-[13px] font-semibold text-foreground'>
              Mode tamu aktif — tanpa akun
            </p>
            <p className='mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground'>
              Tidak ada email, tidak ada pendaftaran. Semua data tersimpan
              hanya di browser perangkat ini dan tidak pernah dikirim ke
              server mana pun.
            </p>
          </div>
        </SectionRow>
        <SectionRow>
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>
              Nama panggilan (opsional)
            </p>
            <p className='text-[11px] text-muted-foreground'>
              Hanya untuk sapaan di layar — ikut tampil di laporan.
            </p>
          </div>
          <div className='flex items-center gap-1.5'>
            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name !== settings.displayName) {
                  updateSettings({ displayName: name.trim() });
                }
              }}
              placeholder='Anonim'
              className='h-9 w-28 rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
            />
            {name !== settings.displayName && (
              <button
                type='button'
                onClick={() => {
                  updateSettings({ displayName: name.trim() });
                  toast.success('Nama disimpan');
                }}
                aria-label='Simpan nama'
                className='grid size-8 place-items-center rounded-full bg-primary/10 text-primary'
              >
                <Check className='size-3.5' />
              </button>
            )}
          </div>
        </SectionRow>
      </SectionCard>

      {/* Default siklus */}
      <SectionCard
        title='Siklusku'
        description='Nilai awal untuk prediksi sebelum Lunay belajar dari riwayatmu.'
      >
        <SectionRow>
          <p className='min-w-0 flex-1 text-[13px] font-medium text-foreground'>
            Panjang siklus
          </p>
          <Stepper
            value={settings.defaultCycleLength}
            min={20}
            max={45}
            unit='hari'
            onChange={(value) =>
              updateSettings({ defaultCycleLength: value })
            }
          />
        </SectionRow>
        <SectionRow>
          <p className='min-w-0 flex-1 text-[13px] font-medium text-foreground'>
            Lama haid
          </p>
          <Stepper
            value={settings.defaultPeriodLength}
            min={2}
            max={10}
            unit='hari'
            onChange={(value) =>
              updateSettings({ defaultPeriodLength: value })
            }
          />
        </SectionRow>
      </SectionCard>

      {/* Pengingat */}
      <ReminderManager />

      {/* Notifikasi */}
      <SectionCard
        title='Notifikasi'
        description='Izinkan notifikasi sistem agar pengingat muncul meski aplikasi di tab lain.'
      >
        <SectionRow>
          <Bell className='size-4.5 shrink-0 text-primary' />
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>
              {perm === 'granted'
                ? 'Notifikasi aktif'
                : perm === 'denied'
                  ? 'Notifikasi diblokir browser'
                  : perm === 'unsupported'
                    ? 'Browser tidak mendukung notifikasi'
                    : 'Notifikasi belum diizinkan'}
            </p>
          </div>
          {perm !== 'granted' && perm !== 'unsupported' && perm !== 'denied' && (
            <button
              type='button'
              onClick={() => void enableNotifications()}
              className='rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            >
              Izinkan
            </button>
          )}
          {perm === 'granted' && (
            <BellRing className='size-4 text-phase-ovulatory' />
          )}
        </SectionRow>
      </SectionCard>

      {/* Keamanan */}
      <SecuritySection />

      {/* Data */}
      <DataSection />

      {/* Tentang */}
      <section className='px-1 pb-2 text-center'>
        <p className='text-[11px] leading-relaxed text-muted-foreground'>
          Lunay v1.0 · data disimpan lokal di perangkatmu.
        </p>
        <p className='mx-auto mt-1.5 max-w-xs text-[10.5px] leading-relaxed text-muted-foreground/80'>
          Lunay membantu melacak pola siklus, bukan alat kontrasepsi, dan
          tidak menggantikan saran medis profesional. Untuk keluhan kesehatan,
          konsultasikan dengan dokter atau bidan.
        </p>
      </section>
    </div>
  );
}
