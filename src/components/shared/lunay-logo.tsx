import { cn } from '@/lib/utils';

/** Marka Lunay: bulan sabit + titik fase. Warna mengikuti token tema. */
export const LunayLogo = ({
  className,
}: {
  className?: string;
}) => (
  <svg viewBox='0 0 32 32' className={cn('size-8', className)} aria-hidden='true'>
    <circle cx='15' cy='16' r='13.5' className='fill-primary' />
    <circle cx='20.5' cy='13' r='11' className='fill-background' />
    <circle cx='24' cy='23' r='2.4' className='fill-primary' />
  </svg>
);

/** Logo + wordmark berdampingan. */
export const LunayWordmark = ({ className }: { className?: string }) => (
  <span className={cn('inline-flex items-center gap-2', className)}>
    <LunayLogo className='size-7' />
    <span className='font-display text-[1.35rem] leading-none font-semibold tracking-tight'>
      lunay
    </span>
  </span>
);
