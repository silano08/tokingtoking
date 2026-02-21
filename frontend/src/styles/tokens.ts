// TDS (Toss Design System) + Duolingo gamification blend
import type { CSSProperties } from 'react'

export const colors = {
  // Primary - Toss Blue
  blue: '#3182f6',       // blue500
  blueDark: '#2272eb',   // blue600
  blueLight: '#e8f3ff',  // blue50

  // Learning accent - Duolingo green (completion/success only)
  green: '#58CC02',
  greenDark: '#58A700',
  greenLight: '#D7FFB8',
  greenBg: '#F0FBE4',

  // Streak & achievement
  orange: '#FF9600',
  orangeLight: '#FFF3D9',
  golden: '#FFC800',

  // Error - TDS red
  red: '#f04452',        // red500
  redLight: '#FFE0E0',

  // Premium
  purple: '#CE82FF',
  purpleLight: '#F3E8FF',

  // TDS Grey Scale
  white: '#FFFFFF',
  bg: '#f2f4f6',         // grey100
  surface: '#e5e8eb',    // grey200
  border: '#e5e8eb',     // grey200
  borderLight: '#f2f4f6', // grey100

  // TDS Text
  text: '#191f28',           // grey900
  textSecondary: '#4e5968',  // grey700
  textTertiary: '#8b95a1',   // grey500
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

// TDS Typography scale
export const font = {
  h1: { fontSize: '26px', fontWeight: 700, lineHeight: '1.3' } as CSSProperties,   // t2
  h2: { fontSize: '22px', fontWeight: 700, lineHeight: '1.4' } as CSSProperties,   // t3
  h3: { fontSize: '17px', fontWeight: 700, lineHeight: '1.4' } as CSSProperties,   // t5
  body: { fontSize: '15px', fontWeight: 400, lineHeight: '1.5' } as CSSProperties,  // t6
  bodyBold: { fontSize: '15px', fontWeight: 600, lineHeight: '1.5' } as CSSProperties,
  caption: { fontSize: '13px', fontWeight: 400, lineHeight: '1.4' } as CSSProperties, // t7
  small: { fontSize: '11px', fontWeight: 500, lineHeight: '1.3' } as CSSProperties,
}

// TDS flat shadows (no Duolingo 3D depth)
export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.04)',
  md: '0 2px 8px rgba(0,0,0,0.06)',
  lg: '0 4px 16px rgba(0,0,0,0.08)',
  card: 'none',
  button: 'none',
  buttonBlue: 'none',
}

// TDS-style header (subtle 1px border)
export const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '56px',
  padding: `0 ${spacing.lg}px`,
  borderBottom: `1px solid ${colors.border}`,
  backgroundColor: colors.white,
}

export const backBtnStyle: CSSProperties = {
  border: 'none',
  background: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  padding: `${spacing.xs}px ${spacing.sm}px`,
  color: colors.text,
  fontWeight: 700,
}

export const headerTitleStyle: CSSProperties = {
  ...font.h3,
  marginLeft: `${spacing.sm}px`,
  color: colors.text,
}

// TDS flat primary button (Toss Blue)
export const primaryBtnStyle: CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: `${radius.lg}px`,
  border: 'none',
  backgroundColor: colors.blue,
  color: colors.textOnPrimary,
  ...font.h3,
  cursor: 'pointer',
}

// TDS flat secondary button
export const secondaryBtnStyle: CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: `${radius.lg}px`,
  border: 'none',
  backgroundColor: colors.bg,
  color: colors.text,
  ...font.bodyBold,
  cursor: 'pointer',
}

export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.white,
}
