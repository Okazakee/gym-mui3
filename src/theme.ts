import { createTheme, alpha } from '@mui/material/styles';

// Material You / Material Design 3 color tokens
// These will be overridden by CSS custom properties when dynamic colors are available
const md3Colors = {
  primary: {
    main: '#6750A4',
    light: '#D0BCFF',
    dark: '#381E72',
    container: '#EADDFF',
    onContainer: '#21005D',
  },
  secondary: {
    main: '#625B71',
    light: '#CCC2DC',
    dark: '#332D41',
    container: '#E8DEF8',
    onContainer: '#1D192B',
  },
  tertiary: {
    main: '#7D5260',
    light: '#FFD8E4',
    dark: '#31111D',
    container: '#FFD8E4',
    onContainer: '#31111D',
  },
  error: {
    main: '#B3261E',
    container: '#F9DEDC',
    onContainer: '#410E0B',
  },
  success: {
    main: '#1B873B',
    container: '#B7F5C7',
    onContainer: '#002106',
  },
  surface: {
    main: '#FEF7FF',
    variant: '#E7E0EC',
    container: '#F3EDF7',
    containerHigh: '#ECE6F0',
    containerHighest: '#E6E0E9',
  },
  surfaceDark: {
    main: '#141218',
    variant: '#49454F',
    container: '#211F26',
    containerHigh: '#2B2930',
    containerHighest: '#36343B',
  },
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
};

// CSS to inject for Material You support
export const materialYouStyles = `
  :root {
    /* Fallback colors - will be overridden by system colors when available */
    --md-sys-color-primary: ${md3Colors.primary.main};
    --md-sys-color-primary-light: ${md3Colors.primary.light};
    --md-sys-color-primary-dark: ${md3Colors.primary.dark};
    --md-sys-color-secondary: ${md3Colors.secondary.main};
    --md-sys-color-surface: ${md3Colors.surface.main};
    --md-sys-color-surface-dark: ${md3Colors.surfaceDark.main};
  }

  /* Material You: Use system accent color when available (Chrome 121+ on Android 14+) */
  @supports (color: AccentColor) {
    :root {
      --md-sys-color-primary: AccentColor;
    }
  }

  /* For browsers that support the newer system colors */
  @supports (color: -webkit-focus-ring-color) {
    :root {
      --md-sys-color-primary: -webkit-focus-ring-color;
    }
  }
`;

export const lightTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: md3Colors.primary.main,
      light: md3Colors.primary.light,
      dark: md3Colors.primary.dark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: md3Colors.secondary.main,
      light: md3Colors.secondary.light,
      dark: md3Colors.secondary.dark,
    },
    error: {
      main: md3Colors.error.main,
    },
    success: {
      main: md3Colors.success.main,
    },
    background: {
      default: md3Colors.surface.main,
      paper: md3Colors.surface.container,
    },
    divider: md3Colors.outlineVariant,
  },
  typography: {
    fontFamily: '"Outfit Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 400, fontSize: '2.25rem', lineHeight: 1.2 },
    h2: { fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.3 },
    h3: { fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.4 },
    h4: { fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 500, fontSize: '1.1rem', lineHeight: 1.4 },
    h6: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.4 },
    subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 },
    body1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.43 },
    button: { fontWeight: 500, fontSize: '0.875rem', textTransform: 'none' },
    caption: { fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.66 },
    overline: { fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.1em' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ${materialYouStyles}
        body {
          scrollbar-width: thin;
        }
        body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        body::-webkit-scrollbar-thumb {
          background-color: ${md3Colors.outlineVariant};
          border-radius: 4px;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: alpha(md3Colors.primary.main, 0.9),
          },
        },
        outlined: {
          borderColor: md3Colors.outline,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          boxShadow: 'none',
          border: `1px solid ${md3Colors.outlineVariant}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: `0 1px 2px ${alpha('#000', 0.05)}, 0 1px 3px ${alpha('#000', 0.1)}`,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 1px 3px ${alpha('#000', 0.12)}, 0 4px 8px ${alpha('#000', 0.08)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        filled: {
          backgroundColor: md3Colors.secondary.container,
          color: md3Colors.secondary.onContainer,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: md3Colors.surface.containerHigh,
          borderTop: `1px solid ${md3Colors.outlineVariant}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: md3Colors.primary.main,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: md3Colors.primary.light,
      light: md3Colors.primary.main,
      dark: md3Colors.primary.container,
      contrastText: md3Colors.primary.dark,
    },
    secondary: {
      main: md3Colors.secondary.light,
      light: md3Colors.secondary.main,
      dark: md3Colors.secondary.container,
    },
    error: {
      main: '#F2B8B5',
    },
    success: {
      main: '#86EFAC',
    },
    background: {
      default: md3Colors.surfaceDark.main,
      paper: md3Colors.surfaceDark.container,
    },
    divider: md3Colors.surfaceDark.variant,
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiCssBaseline: {
      styleOverrides: `
        ${materialYouStyles}
        body {
          scrollbar-width: thin;
        }
        body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        body::-webkit-scrollbar-thumb {
          background-color: ${md3Colors.surfaceDark.variant};
          border-radius: 4px;
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          boxShadow: 'none',
          border: `1px solid ${md3Colors.surfaceDark.variant}`,
          backgroundColor: md3Colors.surfaceDark.containerHigh,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          backgroundImage: 'none',
          backgroundColor: md3Colors.surfaceDark.containerHigh,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
          backgroundColor: md3Colors.surfaceDark.containerHigh,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: md3Colors.surfaceDark.containerHigh,
          borderTop: `1px solid ${md3Colors.surfaceDark.variant}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        filled: {
          backgroundColor: alpha(md3Colors.primary.light, 0.2),
          color: md3Colors.primary.light,
        },
      },
    },
  },
});
