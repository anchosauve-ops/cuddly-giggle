export const colors = {
  // Core dark palette - low glare, red-team friendly
  bg: '#0a0a0b',
  bgElevated: '#121214',
  bgCard: '#16161a',
  bgInput: '#1c1c21',
  
  border: '#2a2a30',
  borderSubtle: '#1f1f24',
  
  text: '#e8e8ed',
  textSecondary: '#a0a0ab',
  textMuted: '#6b6b76',
  textDim: '#4a4a55',
  
  // Accent - warm amber, not loud
  accent: '#d4a017',
  accentDim: '#9a7510',
  accentBg: 'rgba(212, 160, 23, 0.12)',
  
  // Status
  success: '#3dd68c',
  warning: '#f5a623',
  danger: '#ff5c5c',
  info: '#5b9cff',
  
  // Tool approval
  approve: '#3dd68c',
  deny: '#ff5c5c',
  edit: '#5b9cff',
  
  // Live indicators
  live: '#3dd68c',
  idle: '#6b6b76',
  error: '#ff5c5c',
} as const;

export type ColorKey = keyof typeof colors;
