import { useMemo, useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@/utils/theme'
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Speed as SpeedIcon,
  Sync as SyncIcon,
} from '@mui/icons-material'
import { useTheme as useMuiTheme, type Theme } from '@mui/material/styles'
import { useTheme } from '../../contexts/ThemeContext'
import { useRefreshInterval } from '../../contexts/RefreshContext'

interface TopBarProps {
  drawerWidth: number
  onMenuClick: () => void
  refreshInterval: number
  onRefreshIntervalChange: (interval: number) => void
}

export default function TopBar({
  drawerWidth,
  onMenuClick,
  refreshInterval,
  onRefreshIntervalChange,
}: TopBarProps) {
  const muiTheme = useMuiTheme<Theme>()
  const { mode, toggleTheme } = useTheme()
  const location = useLocation()
  const { triggerRefresh } = useRefreshInterval()
  const [refreshMenuAnchor, setRefreshMenuAnchor] = useState<null | HTMLElement>(null)

  const handleRefreshMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setRefreshMenuAnchor(event.currentTarget)
  }

  const handleRefreshMenuClose = () => {
    setRefreshMenuAnchor(null)
  }

  const handleRefreshIntervalChange = (interval: number) => {
    onRefreshIntervalChange(interval)
    handleRefreshMenuClose()
  }

  const handleRefresh = () => {
    triggerRefresh()
  }

  const getRefreshLabel = () => {
    if (refreshInterval === 0) return 'Manual'
    return `${refreshInterval / 1000}s sync`
  }

  const pageMeta = useMemo(() => {
    const routes = [
      { path: '/', title: 'Dashboard', subtitle: 'Live radio and system telemetry' },
      { path: '/device', title: 'Device', subtitle: 'Hardware identity and SIM profile' },
      { path: '/network', title: 'Network', subtitle: 'Radio, carrier and APN controls' },
      { path: '/phone', title: 'Phone', subtitle: 'Call handling and voice controls' },
      { path: '/sms', title: 'SMS', subtitle: 'Messaging timeline and send flow' },
      { path: '/config', title: 'Configuration', subtitle: 'System policies and interface behavior' },
      { path: '/ota', title: 'OTA Update', subtitle: 'Firmware package lifecycle' },
      { path: '/at-console', title: 'AT Console', subtitle: 'Direct modem command interface' },
      { path: '/terminal', title: 'Web Terminal', subtitle: 'Remote shell and diagnostics' },
    ]

    return routes.find((route) => (
      route.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(route.path)
    )) ?? routes[0]
  }, [location.pathname])

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: { xs: 12, sm: 20 },
        left: { xs: 16, sm: `calc(${drawerWidth}px + 24px)` },
        right: { xs: 16, sm: 24 },
        zIndex: muiTheme.zIndex.appBar,
        transition: muiTheme.transitions.create(['left', 'right'], {
          duration: muiTheme.transitions.duration.standard,
        }),
      }}
    >
      <Paper
        sx={{
          borderRadius: { xs: 4, sm: 5 },
          border: `1px solid ${alpha(muiTheme.palette.divider, 0.9)}`,
          backgroundColor: alpha(muiTheme.palette.background.paper, muiTheme.palette.mode === 'dark' ? 0.8 : 0.84),
          backdropFilter: 'blur(24px)',
          boxShadow: `0 18px 42px ${alpha(muiTheme.palette.common.black, muiTheme.palette.mode === 'dark' ? 0.28 : 0.08)}`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 72, sm: 84 }, px: { xs: 1.5, sm: 2.25 } }}>
          <Tooltip title="Toggle navigation">
            <IconButton
              onClick={onMenuClick}
              sx={{
                mr: 1.5,
                backgroundColor: alpha(muiTheme.palette.primary.main, 0.12),
                color: 'primary.main',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Stack spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="overline" color="text.secondary">
                UDX710 Control Surface
              </Typography>
              <Chip
                icon={<SyncIcon sx={{ fontSize: 16 }} />}
                label={refreshInterval === 0 ? 'Manual refresh' : 'Live sync'}
                size="small"
                color={refreshInterval === 0 ? 'default' : 'primary'}
                variant="outlined"
              />
            </Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              {pageMeta.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {pageMeta.subtitle}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
            <Chip
              icon={<SpeedIcon sx={{ fontSize: 16 }} />}
              label={getRefreshLabel()}
              onClick={handleRefreshMenuOpen}
              variant="outlined"
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            />
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  backgroundColor: alpha(muiTheme.palette.secondary.main, 0.12),
                  color: 'secondary.main',
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh now">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.12),
                  color: 'primary.main',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu
            anchorEl={refreshMenuAnchor}
            open={Boolean(refreshMenuAnchor)}
            onClose={handleRefreshMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
              },
            }}
          >
            <MenuItem selected={refreshInterval === 1000} onClick={() => handleRefreshIntervalChange(1000)}>
              1 second
            </MenuItem>
            <MenuItem selected={refreshInterval === 3000} onClick={() => handleRefreshIntervalChange(3000)}>
              3 seconds
            </MenuItem>
            <MenuItem selected={refreshInterval === 5000} onClick={() => handleRefreshIntervalChange(5000)}>
              5 seconds
            </MenuItem>
            <MenuItem selected={refreshInterval === 10000} onClick={() => handleRefreshIntervalChange(10000)}>
              10 seconds
            </MenuItem>
            <MenuItem selected={refreshInterval === 0} onClick={() => handleRefreshIntervalChange(0)}>
              Manual refresh
            </MenuItem>
          </Menu>
        </Toolbar>
      </Paper>
    </Box>
  )
}
