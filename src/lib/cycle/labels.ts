import type {
  CervicalFluid,
  FlowIntensity,
  MoodId,
  PhaseId,
  SymptomId,
} from '@/types/cycle.type';

/** Label & copy bahasa Indonesia untuk seluruh enum domain. */

export const LABELS = {
  flow: {
    spotting: { label: 'Bercak', droplets: 1 },
    light: { label: 'Sedikit', droplets: 2 },
    medium: { label: 'Sedang', droplets: 3 },
    heavy: { label: 'Banyak', droplets: 4 },
  } satisfies Record<FlowIntensity, { label: string; droplets: number }>,

  symptoms: {
    cramps: { label: 'Kram perut' },
    bloating: { label: 'Perut kembung' },
    acne: { label: 'Jerawat' },
    headache: { label: 'Sakit kepala' },
    fatigue: { label: 'Lemas' },
    backache: { label: 'Punggung pegal' },
    nausea: { label: 'Mual' },
    tender_breasts: { label: 'Payudara tegang' },
  } satisfies Record<SymptomId, { label: string }>,

  moods: {
    happy: { label: 'Bahagia' },
    calm: { label: 'Tenang' },
    energetic: { label: 'Berenergi' },
    sensitive: { label: 'Sentimentil' },
    irritable: { label: 'Mudah tersinggung' },
    anxious: { label: 'Cemas' },
    sad: { label: 'Sedih' },
    angry: { label: 'Marah' },
  } satisfies Record<MoodId, { label: string }>,

  fluid: {
    dry: {
      label: 'Kering',
      description: 'Sama sekali tidak ada atau sangat sedikit',
    },
    sticky: {
      label: 'Lengket',
      description: 'Kental dan lengket, seperti lem',
    },
    creamy: {
      label: 'Krim',
      description: 'Lembap, putih seperti losion',
    },
    egg_white: {
      label: 'Seperti putih telur',
      description: 'Jernih, licin, elastis — tanda paling subur',
    },
  } satisfies Record<CervicalFluid, { label: string; description: string }>,

  phase: {
    menstrual: {
      label: 'Menstruasi',
      tagline: 'Hormon di titik terendah',
      description:
        'Lapisan rahim terlepaskan. Estrogen dan progesteron berada di titik terendah — wajar merasa lemas atau lebih sensitif. Istirahat yang cukup dan tetap terhidrasi membantu.',
    },
    follicular: {
      label: 'Folikuler',
      tagline: 'Energi mulai naik',
      description:
        'Estrogen perlahan naik dan folikel di indung telur mulai matang. Banyak orang merasa lebih berenergi dan fokus di fase ini — waktu yang baik untuk memulai hal baru.',
    },
    ovulatory: {
      label: 'Ovulasi',
      tagline: 'Puncak masa subur',
      description:
        'Lonjakan LH memicu pelepasan sel telur. Estrogen di puncaknya — energi dan libido sering meningkat. Inilah jendela paling subur dalam siklusmu.',
    },
    luteal: {
      label: 'Luteal',
      tagline: 'Progesteron mendominasi',
      description:
        'Setelah ovulasi, progesteron naik untuk menyiapkan lapisan rahim. Jika tidak ada pembuahan, hormon turun kembali — bisa memicu PMS seperti payudara tegang atau mood berubah.',
    },
  } satisfies Record<PhaseId, { label: string; tagline: string; description: string }>,
} as const;

export const SYMPTOM_IDS = Object.keys(LABELS.symptoms) as SymptomId[];
export const MOOD_IDS = Object.keys(LABELS.moods) as MoodId[];
export const FLUID_IDS = Object.keys(LABELS.fluid) as CervicalFluid[];
export const FLOW_IDS = Object.keys(LABELS.flow) as FlowIntensity[];
