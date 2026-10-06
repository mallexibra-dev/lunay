'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { medicationReminderFormSchema } from '@/schemas/cycle.schema';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionCard, SectionRow } from './section-card';

const newId = () =>
  `med-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Kelola pengingat: haid, obat/kontrasepsi, dan higiene. */
export const ReminderManager = () => {
  const { data, upsertReminder, toggleReminder, removeReminder } =
    useCycleStore();
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('08:00');
  const [error, setError] = useState<string | null>(null);

  const period = data.reminders.find((r) => r.type === 'period');
  const hygiene = data.reminders.find((r) => r.type === 'hygiene');
  const medications = data.reminders.filter((r) => r.type === 'medication');

  const submitMedication = () => {
    const parsed = medicationReminderFormSchema.safeParse({ label, time });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    upsertReminder({
      id: newId(),
      type: 'medication',
      enabled: true,
      label: parsed.data.label,
      time: parsed.data.time,
      daysBefore: 2,
      intervalHours: 4,
    });
    toast.success('Pengingat ditambahkan');
    setLabel('');
    setTime('08:00');
    setError(null);
    setAddOpen(false);
  };

  return (
    <SectionCard
      title='Pengingat'
      description='Pengingat berbunyi selama aplikasi terbuka — lengkap dengan notifikasi bila izin diberikan.'
    >
      {/* Pengingat haid */}
      {period && (
        <SectionRow>
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>
              {period.label}
            </p>
            <div className='mt-1.5 flex items-center gap-1.5'>
              <span className='text-[11px] text-muted-foreground'>ingatkan</span>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type='button'
                  onClick={() =>
                    upsertReminder({ ...period, daysBefore: n })
                  }
                  disabled={!period.enabled}
                  className={
                    period.daysBefore === n
                      ? 'rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground'
                      : 'rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40'
                  }
                >
                  {n} hari
                </button>
              ))}
              <span className='text-[11px] text-muted-foreground'>sebelumnya</span>
            </div>
          </div>
          <Switch
            checked={period.enabled}
            onCheckedChange={() => toggleReminder(period.id)}
            aria-label='Aktifkan pengingat haid'
          />
        </SectionRow>
      )}

      {/* Pengingat higiene */}
      {hygiene ? (
        <SectionRow>
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>
              {hygiene.label}
            </p>
            <div className='mt-1.5 flex items-center gap-1.5'>
              <span className='text-[11px] text-muted-foreground'>tiap</span>
              {[3, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  type='button'
                  onClick={() => upsertReminder({ ...hygiene, intervalHours: h })}
                  disabled={!hygiene.enabled}
                  className={
                    hygiene.intervalHours === h
                      ? 'rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground'
                      : 'rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40'
                  }
                >
                  {h} jam
                </button>
              ))}
            </div>
          </div>
          <Switch
            checked={hygiene.enabled}
            onCheckedChange={() => toggleReminder(hygiene.id)}
            aria-label='Aktifkan pengingat higiene'
          />
        </SectionRow>
      ) : (
        <SectionRow>
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>
              Pengingat higiene
            </p>
            <p className='text-[11px] text-muted-foreground'>
              Ingatkan ganti pembalut/tampon/cup selama haid.
            </p>
          </div>
          <button
            type='button'
            onClick={() =>
              upsertReminder({
                id: 'hygiene',
                type: 'hygiene',
                enabled: true,
                label: 'Pengingat higiene',
                time: '09:00',
                daysBefore: 2,
                intervalHours: 4,
              })
            }
            className='grid size-8 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20'
            aria-label='Aktifkan pengingat higiene'
          >
            <Plus className='size-4' />
          </button>
        </SectionRow>
      )}

      {/* Pengingat obat */}
      {medications.map((med) => (
        <SectionRow key={med.id}>
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-medium text-foreground'>{med.label}</p>
            <p className='text-[11px] text-muted-foreground'>
              Setiap hari · {med.time}
            </p>
          </div>
          <button
            type='button'
            onClick={() => {
              removeReminder(med.id);
              toast('Pengingat dihapus');
            }}
            aria-label={`Hapus pengingat ${med.label}`}
            className='grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
          >
            <Trash2 className='size-4' />
          </button>
          <Switch
            checked={med.enabled}
            onCheckedChange={() => toggleReminder(med.id)}
            aria-label={`Aktifkan pengingat ${med.label}`}
          />
        </SectionRow>
      ))}

      <SectionRow>
        <button
          type='button'
          onClick={() => setAddOpen(true)}
          className='inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary'
        >
          <Plus className='size-4' />
          Tambah pengingat obat / vitamin
        </button>
      </SectionRow>

      <p className='px-4 pb-3.5 pt-2 text-[10.5px] leading-relaxed text-muted-foreground'>
        Catatan: notifikasi otomatis membutuhkan browser tetap terbuka. Semua
        pengingat tetap tercatat di sini sebagai pengingat manual.
      </p>

      {/* Dialog tambah obat */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className='app-theme max-w-[calc(100vw-2.5rem)] rounded-2xl bg-card sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='text-left text-foreground'>
              Pengingat obat / suplemen
            </DialogTitle>
            <DialogDescription className='text-left text-muted-foreground'>
              Misalnya: pil KB, vitamin D, zat besi.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-3'>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='Nama obat'
              className='h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
            />
            <label className='text-xs text-muted-foreground'>
              Jam pengingat
              <input
                type='time'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className='mt-1 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
              />
            </label>
            {error && <p className='text-xs text-destructive'>{error}</p>}
          </div>
          <DialogFooter>
            <button
              type='button'
              onClick={submitMedication}
              className='w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            >
              Simpan Pengingat
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
};
