/**
 * Design System Colors - Based on nh.html
 * Dark theme with teal accent colors
 */

export const colors = {
  // Base colors
  white: 'rgba(255, 255, 255, 1)',
  cream50: 'rgba(252, 252, 249, 1)',
  cream100: 'rgba(255, 255, 253, 1)',

  // Grays
  gray200: 'rgb(0, 0, 0)',
  gray300: 'rgb(0, 0, 0)',
  gray400: 'rgb(0, 6, 6)',
  slate500: 'rgb(0, 6, 8)',
  slate900: 'rgb(1, 11, 13)',

  // Charcoal (dark theme)
  charcoal700: 'rgba(31, 33, 33, 1)',
  charcoal800: 'rgba(38, 40, 40, 1)',

  // Teal (primary)
  teal300: 'rgba(50, 184, 198, 1)',
  teal500: 'rgba(33, 128, 141, 1)',
  teal600: 'rgba(29, 116, 128, 1)',
  teal700: 'rgba(26, 104, 115, 1)',

  // Status colors
  red400: 'rgba(255, 84, 89, 1)',
  red500: 'rgba(192, 21, 47, 1)',
  orange400: 'rgba(230, 129, 97, 1)',
  orange500: 'rgba(168, 75, 47, 1)',
};

export const semanticColors = {
  background: colors.white,
  surface: colors.white,
  text: colors.gray200,
  textSecondary: 'rgba(167, 169, 169, 0.7)',
  primary: colors.teal300,
  primaryHover: colors.teal500,
  primaryActive: colors.teal600,
  border: 'rgba(119, 124, 124, 0.3)',
  cardBorder: 'rgba(119, 124, 124, 0.2)',
  error: colors.red400,
  success: colors.teal300,
  warning: colors.orange400,
};

export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
};

export const radius = {
  sm: '6px',
  base: '8px',
  md: '10px',
  lg: '12px',
  full: '9999px',
};

export const typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  heading1: {
    fontSize: '24px',
    fontWeight: 600,
  },
  heading2: {
    fontSize: '20px',
    fontWeight: 600,
  },
  heading3: {
    fontSize: '18px',
    fontWeight: 600,
  },
  body: {
    fontSize: '14px',
    fontWeight: 400,
  },
  small: {
    fontSize: '12px',
    fontWeight: 400,
  },
};
