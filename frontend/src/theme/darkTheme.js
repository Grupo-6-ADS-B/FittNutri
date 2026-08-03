import { createTheme } from '@mui/material/styles';
import { commonComponents, commonShape, commonTypography } from './baseTheme';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#66bb6a',
      light: '#8dff8f',
      dark: '#338a3e',
      contrastText: '#041006',
    },
    secondary: {
      main: '#ffb74d',
      light: '#ffe97d',
      dark: '#c88719',
      contrastText: '#1f1300',
    },
    background: {
      default: '#0b1220',
      paper: '#121a2b',
    },
    text: {
      primary: '#e8eef7',
      secondary: '#b5c0d0',
    },
    divider: 'rgba(232, 238, 247, 0.12)',
    action: {
      hover: 'rgba(102, 187, 106, 0.10)',
      selected: 'rgba(102, 187, 106, 0.16)',
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
    '0 1px 3px rgba(0, 0, 0, 0.30), 0 1px 2px rgba(0, 0, 0, 0.20)',
    '0 4px 6px rgba(0, 0, 0, 0.28), 0 2px 4px rgba(0, 0, 0, 0.18)',
    '0 10px 15px rgba(0, 0, 0, 0.30), 0 4px 6px rgba(0, 0, 0, 0.20)',
    '0 20px 25px rgba(0, 0, 0, 0.34), 0 10px 10px rgba(0, 0, 0, 0.22)',
    '0 25px 50px rgba(0, 0, 0, 0.45), 0 12px 18px rgba(0, 0, 0, 0.25)',
    ...Array(19).fill('0 25px 50px rgba(0, 0, 0, 0.45), 0 12px 18px rgba(0, 0, 0, 0.25)'),
  ],
  components: commonComponents,
});
