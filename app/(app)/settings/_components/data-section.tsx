'use client';

import { useRef } from 'react';
import { Download, FlaskConical, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useCycleStore } from '@/hooks/use-cycle-store';
import {
  buildDemoData,
  parseImportedData,
  serializeAppData,
} from '@/lib/cycle/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SectionCard, SectionRow } from './section-card';

/** Seksi data: ekspor, impor, data contoh, hapus semua. */
export const DataSection = () => {
  const { data, replaceData, resetAll } = useCycleStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([serializeAppData(data)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `lunay-backup-${data.periods.length ? data.periods[0].start : 'kosong'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Backup diunduh', {
      description: 'Simpan filenya di tempat aman.',
    });
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseImportedData(text);
    if (!parsed) {
      toast.error('File tidak valid', {
        description: 'Gunakan backup JSON hasil ekspor Lunay.',
      });
      return;
    }
    replaceData(parsed);
    toast.success('Data berhasil dipulihkan');
  };

  return (
    <SectionCard
      title='Data & Backup'
      description='Kamu pemilik penuh datamu — bawa ke mana saja.'
    >
      <SectionRow>
        <Download className='size-4 shrink-0 text-primary' />
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-medium text-foreground'>Ekspor backup</p>
          <p className='text-[11px] text-muted-foreground'>
            Unduh seluruh data sebagai file JSON.
          </p>
        </div>
        <button
          type='button'
          onClick={download}
          className='rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
        >
          Unduh
        </button>
      </SectionRow>

      <SectionRow>
        <Upload className='size-4 shrink-0 text-primary' />
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-medium text-foreground'>Impor backup</p>
          <p className='text-[11px] text-muted-foreground'>
            Pulihkan dari file JSON. Data lama akan diganti.
          </p>
        </div>
        <input
          ref={fileRef}
          type='file'
          accept='application/json,.json'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importFile(file);
            e.target.value = '';
          }}
        />
        <button
          type='button'
          onClick={() => fileRef.current?.click()}
          className='rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
        >
          Pilih file
        </button>
      </SectionRow>

      <SectionRow>
        <FlaskConical className='size-4 shrink-0 text-primary' />
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-medium text-foreground'>Muat data contoh</p>
          <p className='text-[11px] text-muted-foreground'>
            Coba Lunay dengan ~6 siklus data demo. Mengganti data sekarang.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type='button'
              className='rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
            >
              Muat
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className='app-theme max-w-[calc(100vw-2.5rem)] rounded-2xl bg-card sm:max-w-sm'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-foreground'>
                Ganti dengan data contoh?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground'>
                Data yang sekarang ada akan ditimpa oleh ~6 siklus data demo.
                Ekspor backup dulu bila perlu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-2'>
              <AlertDialogCancel className='mt-0 flex-1 rounded-xl border-border bg-transparent text-foreground hover:bg-secondary'>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                className='mt-0 flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
                onClick={() => {
                  replaceData(buildDemoData());
                  toast.success('Data contoh dimuat');
                }}
              >
                Muat demo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SectionRow>

      <SectionRow>
        <Trash2 className='size-4 shrink-0 text-destructive' />
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-medium text-foreground'>
            Hapus semua data
          </p>
          <p className='text-[11px] text-muted-foreground'>
            Semua catatan dihapus permanen dari perangkat ini.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type='button'
              className='rounded-full border border-destructive/40 px-3.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10'
            >
              Hapus
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className='app-theme max-w-[calc(100vw-2.5rem)] rounded-2xl bg-card sm:max-w-sm'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-foreground'>
                Hapus semua data?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground'>
                Tindakan ini tidak bisa dibatalkan. Seluruh catatan haid,
                gejala, dan pengaturan akan hilang dari perangkat ini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-2'>
              <AlertDialogCancel className='mt-0 flex-1 rounded-xl border-border bg-transparent text-foreground hover:bg-secondary'>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                className='mt-0 flex-1 rounded-xl bg-destructive text-white hover:bg-destructive/90'
                onClick={resetAll}
              >
                Ya, hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SectionRow>
    </SectionCard>
  );
};
