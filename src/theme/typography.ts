import { TextStyle } from 'react-native';

// Small, dense, readable. Optimized for long sessions on phone.
export const fontSize = {
  xs: 10,
  sm: 11,
  base: 12,
  md: 13,
  lg: 14,
  xl: 16,
  xxl: 18,
  title: 15,
  header: 17,
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.4,
  relaxed: 1.55,
} as const;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

export const typography = {
  // Body text - small by design
  body: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  bodySm: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  bodyXs: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  
  // Labels & UI chrome
  label: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
    fontWeight: fontWeight.medium,
  },
  labelSm: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.tight,
    fontWeight: fontWeight.medium,
  },
  
  // Headers - still compact
  title: {
    fontSize: fontSize.title,
    lineHeight: fontSize.title * lineHeight.tight,
    fontWeight: fontWeight.semibold,
  },
  header: {
    fontSize: fontSize.header,
    lineHeight: fontSize.header * lineHeight.tight,
    fontWeight: fontWeight.semibold,
  },
  
  // Code / terminal
  mono: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.relaxed,
    fontFamily: 'monospace',
  },
  monoSm: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.relaxed,
    fontFamily: 'monospace',
  },
} as const;
