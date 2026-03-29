/* Global Styles for UI v2 - Based on nh.html design system */

import { createGlobalStyle } from 'styled-components';
import { semanticColors, shadows, radius, typography } from './theme';

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-background: ${semanticColors.background};
    --color-surface: ${semanticColors.surface};
    --color-text: ${semanticColors.text};
    --color-text-secondary: ${semanticColors.textSecondary};
    --color-primary: ${semanticColors.primary};
    --color-primary-hover: ${semanticColors.primaryHover};
    --color-primary-active: ${semanticColors.primaryActive};
    --color-border: ${semanticColors.border};
    --color-card-border: ${semanticColors.cardBorder};
    --color-error: ${semanticColors.error};
    --color-success: ${semanticColors.success};
    --color-warning: ${semanticColors.warning};
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    --radius-sm: ${radius.sm};
    --radius-base: ${radius.base};
    --radius-md: ${radius.md};
    --radius-lg: ${radius.lg};
    --radius-full: ${radius.full};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${typography.fontFamily};
    background: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
  }

  /* Remove number input spinners */
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }

  /* Smooth transitions */
  * {
    transition: all 0.2s ease;
  }

  /* Focus styles */
  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(50, 184, 198, 0.1);
  }

  /* Disable transitions on position changes */
  input:focus,
  select:focus {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
`;
