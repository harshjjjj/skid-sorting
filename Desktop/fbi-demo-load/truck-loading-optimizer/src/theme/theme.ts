import { createTheme, ThemeOptions } from '@mui/material/styles';
import { THEME_COLORS } from '../utils/constants';

// Create dark and light theme options
const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  return {
    palette: {
      mode,
      primary: {
        main: THEME_COLORS.PRIMARY,
        ...(mode === 'dark' && { dark: THEME_COLORS.PRIMARY }),
      },
      secondary: {
        main: THEME_COLORS.SECONDARY,
      },
      error: {
        main: THEME_COLORS.ERROR,
      },
      warning: {
        main: THEME_COLORS.WARNING,
      },
      success: {
        main: THEME_COLORS.SUCCESS,
      },
      background: {
        default: mode === 'light' ? THEME_COLORS.BACKGROUND_LIGHT : THEME_COLORS.BACKGROUND_DARK,
        paper: mode === 'light' ? '#ffffff' : '#303030',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 600,
      },
      h2: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 500,
      },
      h5: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 500,
      },
      h6: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 500,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: THEME_COLORS.PRIMARY,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
          containedPrimary: {
            boxShadow: '0 4px 6px rgba(26, 58, 95, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 10px rgba(26, 58, 95, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light'
              ? '0 4px 20px rgba(0, 0, 0, 0.08)'
              : '0 4px 20px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minWidth: 100,
            fontWeight: 500,
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
  };
};

// Create light and dark themes
export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme = createTheme(getThemeOptions('dark'));

// Export default theme (light)
export default lightTheme; 