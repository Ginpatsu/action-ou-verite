// Central design tokens for the "hardcore" dark party-game look.
export const colors = {
  bg: '#0B0B0F',
  bgElevated: '#121219',
  surface: '#181823',
  surfaceAlt: '#21212F',
  border: '#2C2C3D',

  primary: '#FF1E56', // hot red — the signature color
  primaryDark: '#C70F3C',
  accent: '#9B5CFF', // electric purple
  accentDark: '#6E33D6',

  success: '#2EE6A6',
  danger: '#FF3B5C',
  warning: '#FFB020',
  gold: '#FFD23F', // winner

  text: '#F5F5F7',
  textMuted: '#9A9AA8',
  textFaint: '#62626F',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
} as const;

export const font = {
  // System fonts; we lean on weight + size for the bold party-game feel.
  black: '900' as const,
  bold: '800' as const,
  semibold: '700' as const,
  medium: '600' as const,
  regular: '400' as const,
};
