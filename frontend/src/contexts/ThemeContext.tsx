/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

function createAppTheme(mode: ThemeMode) {
  const isDark = mode === 'dark'

  const palette = {
    primary: {
      main: isDark ? '#72D1CF' : '#0B6E6E',
      light: isDark ? '#9DE4E0' : '#3C9190',
      dark: isDark ? '#4AB6B3' : '#084F50',
      contrastText: isDark ? '#041617' : '#F4FEFE',
    },
    secondary: {
      main: isDark ? '#AEC3E5' : '#566B8D',
      light: isDark ? '#CDD9F0' : '#7E91AF',
      dark: isDark ? '#8CA8D2' : '#3D506D',
      contrastText: isDark ? '#0A1422' : '#F7F9FD',
    },
    success: {
      main: isDark ? '#65D7B7' : '#1F8A70',
      light: isDark ? '#94E5CC' : '#48A78F',
      dark: isDark ? '#45BE9B' : '#166652',
    },
    warning: {
      main: isDark ? '#F0B35B' : '#C9821F',
      light: isDark ? '#F4C784' : '#D79B4B',
      dark: isDark ? '#DD9A34' : '#956117',
    },
    error: {
      main: isDark ? '#F08C79' : '#C65A46',
      light: isDark ? '#F4A797' : '#D27B6B',
      dark: isDark ? '#DA6D56' : '#964333',
    },
    info: {
      main: isDark ? '#86B8FF' : '#3D7BD9',
      light: isDark ? '#A8CBFF' : '#6899E4',
      dark: isDark ? '#629FEF' : '#2D5DA7',
    },
    background: {
      default: isDark ? '#091018' : '#F3F6FA',
      paper: isDark ? '#101925' : '#FBFCFE',
    },
    text: {
      primary: isDark ? '#E7EEF8' : '#172233',
      secondary: isDark ? '#9AABBF' : '#5C677A',
    },
    divider: isDark ? '#233244' : '#D7DEE8',
  }

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily: [
        '"Aptos"',
        '"Segoe UI Variable"',
        '"Segoe UI"',
        '"PingFang SC"',
        '"Noto Sans SC"',
        'sans-serif',
      ].join(','),
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h6: {
        fontWeight: 700,
        letterSpacing: '-0.015em',
      },
      subtitle1: {
        fontWeight: 600,
      },
      subtitle2: {
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            minHeight: '100%',
          },
          body: {
            minHeight: '100vh',
            color: palette.text.primary,
            backgroundColor: palette.background.default,
            backgroundImage: isDark
              ? `
                radial-gradient(circle at top left, ${alpha('#72D1CF', 0.12)}, transparent 28%),
                radial-gradient(circle at top right, ${alpha('#86B8FF', 0.12)}, transparent 24%),
                linear-gradient(180deg, #091018 0%, #0D1520 100%)
              `
              : `
                radial-gradient(circle at top left, ${alpha('#72D1CF', 0.18)}, transparent 24%),
                radial-gradient(circle at top right, ${alpha('#AEC3E5', 0.18)}, transparent 22%),
                linear-gradient(180deg, #F7FAFD 0%, #EEF3F8 100%)
              `,
            backgroundAttachment: 'fixed',
            '&::before': {
              content: '""',
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: `
                linear-gradient(${alpha(palette.text.primary, isDark ? 0.05 : 0.03)} 1px, transparent 1px),
                linear-gradient(90deg, ${alpha(palette.text.primary, isDark ? 0.05 : 0.03)} 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
              maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.28), transparent 70%)',
            },
            '&::selection': {
              backgroundColor: alpha(palette.primary.main, 0.24),
            },
            scrollbarColor: isDark ? '#41566f #122032' : '#B5C0CD #E7EDF4',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 10,
              height: 10,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 999,
              backgroundColor: isDark ? '#41566f' : '#B5C0CD',
              border: `2px solid ${isDark ? '#122032' : '#E7EDF4'}`,
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: isDark ? '#122032' : '#E7EDF4',
            },
          },
          '#root': {
            minHeight: '100vh',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 6,
            border: `1px solid ${alpha(palette.divider, isDark ? 0.9 : 1)}`,
            backgroundColor: alpha(palette.background.paper, isDark ? 0.88 : 0.9),
            backdropFilter: 'blur(18px)',
            boxShadow: isDark
              ? `0 24px 70px ${alpha('#02060B', 0.45)}`
              : `0 22px 55px ${alpha('#8CA0B8', 0.18)}`,
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
          outlined: {
            borderColor: alpha(palette.divider, isDark ? 0.95 : 1),
            backgroundColor: alpha(palette.background.paper, isDark ? 0.72 : 0.86),
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 6,
            paddingInline: 18,
            textTransform: 'none',
          },
          contained: {
            backgroundImage: `linear-gradient(135deg, ${palette.primary.main}, ${palette.secondary.main})`,
            color: palette.primary.contrastText,
            boxShadow: `0 8px 20px ${alpha(palette.primary.main, isDark ? 0.24 : 0.2)}`,
          },
          outlined: {
            borderColor: alpha(palette.divider, 0.95),
            backgroundColor: alpha(palette.background.paper, isDark ? 0.3 : 0.6),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
          },
          outlined: {
            borderColor: alpha(palette.divider, isDark ? 0.95 : 1),
            backgroundColor: alpha(palette.background.paper, isDark ? 0.2 : 0.55),
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: alpha(palette.divider, isDark ? 0.7 : 0.85),
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: 8,
          },
          switchBase: {
            '&.Mui-checked': {
              color: '#fff',
            },
            '&.Mui-checked + .MuiSwitch-track': {
              opacity: 1,
            },
          },
          thumb: {
            boxShadow: 'none',
            backgroundColor: '#fff',
          },
          track: {
            borderRadius: 999,
            opacity: 1,
            backgroundColor: alpha(palette.text.secondary, isDark ? 0.35 : 0.22),
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(palette.text.secondary, isDark ? 0.25 : 0.14),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: alpha(palette.primary.main, isDark ? 0.16 : 0.08),
            fontWeight: 700,
            color: palette.text.secondary,
            borderBottomColor: alpha(palette.divider, 0.9),
          },
          body: {
            borderBottomColor: alpha(palette.divider, 0.7),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            backgroundImage: isDark
              ? `linear-gradient(180deg, ${alpha('#101925', 0.94)} 0%, ${alpha('#0C141D', 0.98)} 100%)`
              : `linear-gradient(180deg, ${alpha('#F8FBFE', 0.96)} 0%, ${alpha('#EEF3F8', 0.98)} 100%)`,
            backdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? `18px 0 40px ${alpha('#02060B', 0.35)}`
              : `18px 0 40px ${alpha('#8CA0B8', 0.16)}`,
          },
        },
      },
    },
  })
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode')
    return (saved === 'dark' ? 'dark' : 'light') as ThemeMode
  })

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const theme = createAppTheme(mode)

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
