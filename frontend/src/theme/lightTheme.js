import { createTheme } from '@mui/material/styles';
import { commonComponents, commonShape, commonTypography } from './baseTheme';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6f00',
      light: '#ff9f43',
      dark: '#c43e00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f8f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#102018',
      secondary: '#51615b',
    },
    divider: 'rgba(16, 32, 24, 0.10)',
    action: {
      hover: 'rgba(46, 125, 50, 0.08)',
      selected: 'rgba(46, 125, 50, 0.12)',
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  typography: commonTypography,
  shape: commonShape,
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)',
    '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)',
    '0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)',
    '0 25px 50px rgba(0, 0, 0, 0.12), 0 12px 18px rgba(0, 0, 0, 0.06)',
    ...Array(19).fill('0 25px 50px rgba(0, 0, 0, 0.12), 0 12px 18px rgba(0, 0, 0, 0.06)'),
  ],
  components: commonComponents,
});
