export * from './colors';
export * from './spacing';
export * from './typography';

import { colors } from './colors';
import { spacing, borderRadius, iconSizes, avatarSizes } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  borderRadius,
  iconSizes,
  avatarSizes,
  typography,
} as const;

export type Theme = typeof theme;
