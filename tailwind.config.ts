import type { Config } from 'tailwindcss'
import twColors from 'tailwindcss/colors';
import { spacing } from 'tailwindcss/defaultTheme';

const extendedSpacing = {
  ...spacing,
  px: '0.0625rem',
  '0.75': '0.1875rem',
  '5.5': '1.375rem',
  18: '4.5rem',
  21: '5.25rem',
  22: '5.5rem',
  30: '7.5rem',
};

const fontSize = {
  '2xs': '0.875rem', // small
  '3xs': '0.8125rem', // (?)
};

const breakpoints = {
  'mobile': '425px',
  'tablet': '768px',
  laptop: '960px',
  'desktop': '1132px'
};

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: breakpoints,
    spacing: extendedSpacing,
    borderRadius: {
      ...extendedSpacing,
      half: '50%',
      full: "9999px",
    },
    borderWidth: { ...extendedSpacing, DEFAULT: '0.0625rem' },
    extend: {
      fontSize,
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [{
      light: {
        "primary": "#0A85F7",
        "primary-content": "#ffffff",
        "secondary": "#daf0ff",
        "accent": "#69CFEF",
        "base-100": "#fff",
        "base-200": "#F5F4F2",
        "base-300": "#E9E6DE",
        "base-content": "#424242",
        "neutral": "#E0E0E0",
        "neutral-content": "#e1e1e1",
        "success": "rgba(16, 185, 129)",
        "success-content": "#ffffff",
        "error": "rgba(244, 63, 94)",
        "error-content": "#ffffff",
        "warning": "rgba(234, 179, 8)",
        "warning-content": "#ffffff",
      },

      dark: {
        "primary": "#0A85F7",
        "primary-content": "#ffffff",
        "secondary": "#daf0ff",
        "accent": "#69CFEF",
        "base-100": "#fff",
        "base-200": "#F5F4F2",
        "base-300": "#E9E6DE",
        "base-content": "#424242",
        "neutral": "#E0E0E0",
        "neutral-content": "#e1e1e1",
        "success": "rgba(16, 185, 129)",
        "success-content": "#ffffff",
        "error": "rgba(244, 63, 94)",
        "error-content": "#ffffff",
        "warning": "rgba(234, 179, 8)",
        "warning-content": "#ffffff",
      },
    }]
  },
}
export default config
