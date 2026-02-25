import BaseSVG from './BaseSVG';
import { IconSize } from './icons.config';
import IconWrapper from './IconWrapper';

// Base icon props for internal use
interface BaseIconProps {
  size?: IconSize;
  className?: string;
}

// Icon definitions - internal components
const PlusIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </BaseSVG>
  </IconWrapper>
);

const DownloadIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </BaseSVG>
  </IconWrapper>
);

const ExternalLinkIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </BaseSVG>
  </IconWrapper>
);

const ImageIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG fill="currentColor" stroke="none" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </BaseSVG>
  </IconWrapper>
);

const MicrophoneIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG fill="currentColor" stroke="none" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.26 3.69A1.2 1.2 0 0112 4.8v14.4a1.2 1.2 0 01-1.94.98L5.36 15.6H2.4a1.2 1.2 0 01-1.2-1.2V9.6a1.2 1.2 0 011.2-1.2h2.96l4.7-4.58a1.2 1.2 0 011.94.98z"
        clipRule="evenodd"
      />
    </BaseSVG>
  </IconWrapper>
);

const LoadingIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG className="animate-spin">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </BaseSVG>
  </IconWrapper>
);

const CloseIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </BaseSVG>
  </IconWrapper>
);

const ChevronLeftIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </BaseSVG>
  </IconWrapper>
);

const ChevronRightIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </BaseSVG>
  </IconWrapper>
);

const UpArrowIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </BaseSVG>
  </IconWrapper>
);

const SearchIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </BaseSVG>
  </IconWrapper>
);

const FilterIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path
        fill="currentColor"
        d="M4 3h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.553.894l-3 1.5A1 1 0 0110 20.5V12.414L4.293 6.707A1 1 0 014 6V4a1 1 0 011-1z"
      />
    </BaseSVG>
  </IconWrapper>
);

const ActionsIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      />
    </BaseSVG>
  </IconWrapper>
);

const ChevronDownIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </BaseSVG>
  </IconWrapper>
);

const ChevronUpIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </BaseSVG>
  </IconWrapper>
);

const CheckIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </BaseSVG>
  </IconWrapper>
);

// Two overlapping rounded squares: front rect (bottom-right) + visible L-shape of back rect (top-left)
const CopyIconInternal = ({ size = 'md', className }: BaseIconProps) => (
  <IconWrapper size={size} className={className}>
    <BaseSVG>
      {/* Front square */}
      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinejoin="round" strokeWidth={2} />
      {/* Back square — only top and left edges visible behind front square */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
      />
    </BaseSVG>
  </IconWrapper>
);

// Icon mapping for the generic Icon component
export const iconMap = {
  plus: PlusIconInternal,
  download: DownloadIconInternal,
  'external-link': ExternalLinkIconInternal,
  image: ImageIconInternal,
  microphone: MicrophoneIconInternal,
  loading: LoadingIconInternal,
  close: CloseIconInternal,
  'chevron-left': ChevronLeftIconInternal,
  'chevron-right': ChevronRightIconInternal,
  'chevron-down': ChevronDownIconInternal,
  'chevron-up': ChevronUpIconInternal,
  search: SearchIconInternal,
  up: UpArrowIconInternal,
  filter: FilterIconInternal,
  actions: ActionsIconInternal,
  copy: CopyIconInternal,
  check: CheckIconInternal,
} as const;
