import { colors } from './colors';
import { typography, fontSize, fontWeight } from './typography';

export const theme = {
  colors,
  typography,
  fontSize,
  fontWeight,
  spacing: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 24,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    full: 999,
  },
  // Dense layout for small font + one-hand use
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

export type Theme = typeof theme;
export { colors, typography, fontSize, fontWeight };
