export type ToolbarOrientation = 'horizontal' | 'vertical' | 'responsive';
export type ToolbarMobileLayout = 'stack' | 'overflow' | 'dropdown';
export type ToolbarSpacing = 'tight' | 'normal' | 'loose';
export type ToolbarJustify = 'start' | 'center' | 'end' | 'between' | 'around';
export type ToolbarAlign = 'start' | 'center' | 'end' | 'stretch';

// Spacing configurations
export const spacingConfig = {
  tight: 'gap-1',
  normal: 'gap-2',
  loose: 'gap-4',
};

// Justify configurations
export const justifyConfig = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

// Align configurations
export const alignConfig = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};
