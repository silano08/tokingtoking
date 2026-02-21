// Duolingo-inspired design tokens for TokingToking
import type { CSSProperties } from 'react'

export const colors = {
  // Primary - Duolingo green
  green: '#58CC02',
  greenDark: '#58A700',
  greenLight: '#D7FFB8',
  greenBg: '#F0FBE4',

  // Action blue
  blue: '#1CB0F6',
  blueDark: '#1899D6',
  blueLight: '#DDF4FF',

  // Streak & achievement
  orange: '#FF9600',
  orangeLight: '#FFF3D9',
  golden: '#FFC800',

  // Error
  red: '#FF4B4B',
  redLight: '#FFDFE0',

  // Premium
  purple: '#CE82FF',
  purpleLight: '#F3E8FF',

  // Neutrals
  white: '#FFFFFF',
  bg: '#F7F7F7',
  surface: '#F0F0F0',
  border: '#E5E5E5',
  borderLight: '#EEEEEE',

  // Text
  text: '#4B4B4B',
  textSecondary: '#777777',
  textTertiary: '#AFAFAF',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
}

export const font = {
  h1: { fontSize: '24px', fontWeight: 800, lineHeight: '1.3' } as CSSProperties,
  h2: { fontSize: '20px', fontWeight: 700, lineHeight: '1.4' } as CSSProperties,
  h3: { fontSize: '17px', fontWeight: 700, lineHeight: '1.4' } as CSSProperties,
  body: { fontSize: '15px', fontWeight: 400, lineHeight: '1.5' } as CSSProperties,
  bodyBold: { fontSize: '15px', fontWeight: 600, lineHeight: '1.5' } as CSSProperties,
  caption: { fontSize: '13px', fontWeight: 500, lineHeight: '1.4' } as CSSProperties,
  small: { fontSize: '11px', fontWeight: 500, lineHeight: '1.3' } as CSSProperties,
}

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.06)',
  md: '0 2px 8px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.1)',
  card: '0 2px 0 #E5E5E5',       // Duolingo-style bottom border shadow
  button: '0 4px 0 #46A302',     // Duolingo-style button depth (green)
  buttonBlue: '0 4px 0 #1899D6', // Duolingo-style button depth (blue)
}

// Shared style patterns
export const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: `${spacing.md}px ${spacing.lg}px`,
  borderBottom: `2px solid ${colors.border}`,
  backgroundColor: colors.white,
}

export const backBtnStyle: CSSProperties = {
  border: 'none',
  background: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  padding: `${spacing.xs}px ${spacing.sm}px`,
  color: colors.textSecondary,
  fontWeight: 700,
}

export const headerTitleStyle: CSSProperties = {
  ...font.h3,
  marginLeft: `${spacing.sm}px`,
  color: colors.text,
}

export const primaryBtnStyle: CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: `${radius.lg}px`,
  border: 'none',
  backgroundColor: colors.green,
  color: colors.textOnPrimary,
  ...font.h3,
  cursor: 'pointer',
  boxShadow: shadows.button,
  marginBottom: '4px',
}

export const secondaryBtnStyle: CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: `${radius.lg}px`,
  border: `2px solid ${colors.border}`,
  backgroundColor: colors.white,
  color: colors.text,
  ...font.bodyBold,
  cursor: 'pointer',
  boxShadow: shadows.card,
  marginBottom: '2px',
}

export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.white,
}
