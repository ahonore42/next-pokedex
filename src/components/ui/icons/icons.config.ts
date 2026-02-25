export type IconType =
  | 'plus'
  | 'download'
  | 'external-link'
  | 'image'
  | 'microphone'
  | 'loading'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'search'
  | 'up'
  | 'filter'
  | 'actions'
  | 'copy'
  | 'check';

// Size variant system
export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export const sizeVariants = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
  '2xl': 'size-8',
} as const;
