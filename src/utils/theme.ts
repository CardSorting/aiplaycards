import { ThemeOptions, createTheme, responsiveFontSizes } from '@mui/material';

interface CustomThemeProps {
  space: (n: number) => number;
  backgroundGradient: string;
  apple: {
    shadows: {
      soft: string;
      medium: string;
      hard: string;
      card: string;
    };
    blur: {
      glass: string;
      subtle: string;
    };
    surfaces: {
      glass: string;
      frosted: string;
      elevated: string;
    };
    motion: {
      spring: string;
      smooth: string;
      quick: string;
    };
  };
}

declare module '@mui/material/styles' {
  interface Theme {
    custom: CustomThemeProps;
  }
  interface ThemeOptions {
    custom?: Partial<CustomThemeProps>;
  }
}

const spacingAmount = 4;

// Base theme configuration shared between light and dark modes
const baseTheme: ThemeOptions = {
  spacing: spacingAmount,
  palette: {
    primary: {
      main: '#007AFF', // Apple Blue
      dark: '#0056CC',
      light: '#4DA6FF',
    },
    secondary: {
      main: '#FF3B30', // Apple Red
      dark: '#D60017',
      light: '#FF6B60',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F7',
      200: '#E8E8ED',
      300: '#D2D2D7',
      400: '#AEAEB2',
      500: '#8E8E93',
      600: '#636366',
      700: '#48484A',
      800: '#3A3A3C',
      900: '#1D1D1F',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: 'clamp(2.5rem, 8vw, 4rem)',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 'clamp(2rem, 6vw, 3rem)',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1D1D1F',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6E6E73',
    },
  },
  shape: {
    borderRadius: 12, // Apple's preferred radius
  },
};

// Create theme function that accepts mode
export const createAppTheme = (mode: 'light' | 'dark' = 'light') => {
  let theme = createTheme({
    ...baseTheme,
    palette: {
      mode,
      primary: {
        main: '#007AFF', // Apple Blue
        dark: '#0056CC',
        light: '#4DA6FF',
      },
      secondary: {
        main: '#FF3B30', // Apple Red
        dark: '#D60017',
        light: '#FF6B60',
      },
      background:
        mode === 'light'
          ? {
              default: '#F8F9FA',
              paper: 'rgba(255, 255, 255, 0.85)',
            }
          : {
              default: '#0D1117',
              paper: 'rgba(22, 27, 34, 0.85)',
            },
      text:
        mode === 'light'
          ? {
              primary: '#1D1D1F',
              secondary: '#6E6E73',
            }
          : {
              primary: '#F0F6FC',
              secondary: '#8B949E',
            },
      grey: {
        50: mode === 'light' ? '#FAFAFA' : '#161B22',
        100: mode === 'light' ? '#F5F5F7' : '#21262D',
        200: mode === 'light' ? '#E8E8ED' : '#30363D',
        300: mode === 'light' ? '#D2D2D7' : '#484F58',
        400: mode === 'light' ? '#AEAEB2' : '#656D76',
        500: mode === 'light' ? '#8E8E93' : '#8B949E',
        600: mode === 'light' ? '#636366' : '#B1BAC4',
        700: mode === 'light' ? '#48484A' : '#C9D1D9',
        800: mode === 'light' ? '#3A3A3C' : '#F0F6FC',
        900: mode === 'light' ? '#1D1D1F' : '#FAFBFC',
      },
    },
  });

  theme = createTheme(theme, {
    custom: {
      space: (n: number) => n * spacingAmount,
      backgroundGradient:
        mode === 'light'
          ? `radial-gradient(ellipse at top, #F8F9FA 0%, #E8E8ED 100%)`
          : `radial-gradient(ellipse at top, #0D1117 0%, #161B22 100%)`,
      apple: {
        shadows: {
          soft: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.08)',
          medium:
            '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)',
          hard: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.16)',
          card: '0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.1)',
        },
        blur: {
          glass: 'blur(20px)',
          subtle: 'blur(10px)',
        },
        surfaces:
          mode === 'light'
            ? {
                glass: 'rgba(255, 255, 255, 0.85)',
                frosted: 'rgba(255, 255, 255, 0.7)',
                elevated: 'rgba(255, 255, 255, 0.95)',
              }
            : {
                glass: 'rgba(22, 27, 34, 0.85)',
                frosted: 'rgba(22, 27, 34, 0.7)',
                elevated: 'rgba(22, 27, 34, 0.95)',
              },
        motion: {
          spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
          quick: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
      },
    } as CustomThemeProps,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            WebkitTextSizeAdjust: '100%',
          },
          '*': {
            scrollBehavior: 'smooth',
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          color: 'primary',
          elevation: 0,
        },
        styleOverrides: {
          root: {
            height: 65,
            display: 'flex',
            justifyContent: 'center',
            backdropFilter: 'blur(20px)',
            backgroundColor:
              mode === 'light'
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(22, 27, 34, 0.85)',
            borderBottom:
              mode === 'light'
                ? '1px solid rgba(0, 0, 0, 0.06)'
                : '1px solid rgba(240, 246, 252, 0.06)',
            boxShadow:
              mode === 'light'
                ? '0 1px 3px rgba(0, 0, 0, 0.05)'
                : '0 1px 3px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 500,
            padding: '12px 24px',
            fontSize: '1rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
            },
          },
          outlined: {
            borderColor: 'rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderColor: '#007AFF',
            },
          },
          startIcon: {
            position: 'absolute',
            left: '24px',
            top: '50%',
            transform: 'translateY(-50%)',
            margin: 'unset',
          },
          sizeLarge: {
            padding: '16px 32px',
            fontSize: '1.1rem',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor:
              mode === 'light'
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(22, 27, 34, 0.85)',
            backdropFilter: 'blur(20px)',
            border:
              mode === 'light'
                ? '1px solid rgba(0, 0, 0, 0.06)'
                : '1px solid rgba(240, 246, 252, 0.06)',
            boxShadow:
              mode === 'light'
                ? '0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.1)'
                : '0 2px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow:
                mode === 'light'
                  ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.14)'
                  : '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow:
              '0 2px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007AFF',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            padding: '12px 16px',
            fontSize: '1rem',
            fontWeight: 400,
          },
          multiline: {
            padding: '12px 16px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            color: '#007AFF',
            border: '1px solid rgba(0, 122, 255, 0.2)',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.15)',
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: '#007AFF',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              textDecoration: 'underline',
              textDecorationColor: '#007AFF',
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            '&::before': {
              display: 'none',
            },
            '&:not(:last-child)': {
              marginBottom: '16px',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
            minHeight: '64px !important',
            borderRadius: 16,
            '&.Mui-expanded': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          },
          content: {
            margin: '16px 0 !important',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
          },
          icon: {
            alignItems: 'center',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow:
              '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.16)',
            '&:hover': {
              boxShadow:
                '0 6px 20px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
};

// Default light theme export
const theme = createAppTheme('light');
export default theme;
