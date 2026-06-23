import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'dark', // Using dark mode for a modern feel with grays
    primary: {
      main: '#90a4ae', // A cool, muted blue-gray
    },
    secondary: {
      main: '#cfd8dc', // A lighter gray for accents
    },
    background: {
      default: '#263238', // Dark slate gray for main background
      paper: '#37474f',   // Slightly lighter slate gray for cards/paper
    },
    text: {
      primary: '#eceff1', // Off-white for primary text
      secondary: '#b0bec5', // Lighter gray for secondary text
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #455a64',
        },
      },
    },
  },
});

export default theme;
