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
  Translate as TranslateIcon,
} from '@mui/icons-material'
import { useTheme as useMuiTheme, type Theme } from '@mui/material/styles'
import { useTheme } from '../../contexts/ThemeContext'
import { useRefreshInterval } from '../../contexts/RefreshContext'
import { useI18n } from '../../contexts/I18nContext'

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
  const { locale, localeOptions, setLocale, t } = useI18n()
  const location = useLocation()
  const { triggerRefresh } = useRefreshInterval()
  const [refreshMenuAnchor, setRefreshMenuAnchor] = useState<null | HTMLElement>(null)
  const [localeMenuAnchor, setLocaleMenuAnchor] = useState<null | HTMLElement>(null)

  const handleRefreshMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setRefreshMenuAnchor(event.currentTarget)
  }

  const handleRefreshMenuClose = () => {
    setRefreshMenuAnchor(null)
  }

  const handleLocaleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setLocaleMenuAnchor(event.currentTarget)
  }

  const handleLocaleMenuClose = () => {
    setLocaleMenuAnchor(null)
  }

  const handleRefreshIntervalChange = (interval: number) => {
    onRefreshIntervalChange(interval)
    handleRefreshMenuClose()
  }

  const handleRefresh = () => {
    triggerRefresh()
  }

  const getRefreshLabel = () => {
    if (refreshInterval === 0) return t('common.manual')
    return t('common.sync', { seconds: refreshInterval / 1000 })
  }

  const pageMeta = useMemo(() => {
    const routes = [
      { path: '/', titleKey: 'layout.pages.dashboard.title', subtitleKey: 'layout.pages.dashboard.subtitle' },
      { path: '/device', titleKey: 'layout.pages.device.title', subtitleKey: 'layout.pages.device.subtitle' },
      { path: '/network', titleKey: 'layout.pages.network.title', subtitleKey: 'layout.pages.network.subtitle' },
      { path: '/phone', titleKey: 'layout.pages.phone.title', subtitleKey: 'layout.pages.phone.subtitle' },
      { path: '/sms', titleKey: 'layout.pages.sms.title', subtitleKey: 'layout.pages.sms.subtitle' },
      { path: '/config', titleKey: 'layout.pages.configuration.title', subtitleKey: 'layout.pages.configuration.subtitle' },
      { path: '/ota', titleKey: 'layout.pages.ota.title', subtitleKey: 'layout.pages.ota.subtitle' },
      { path: '/at-console', titleKey: 'layout.pages.atConsole.title', subtitleKey: 'layout.pages.atConsole.subtitle' },
      { path: '/terminal', titleKey: 'layout.pages.terminal.title', subtitleKey: 'layout.pages.terminal.subtitle' },
    ]

    return routes.find((route) => (
      route.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(route.path)
    )) ?? routes[0]
  }, [location.pathname])

  const localeLabelKey = locale === 'zh-CN' ? 'locale.zhCN' : 'locale.enUS'

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
          borderRadius: 5,
          border: `1px solid ${alpha(muiTheme.palette.divider, 0.9)}`,
          backgroundColor: alpha(muiTheme.palette.background.paper, muiTheme.palette.mode === 'dark' ? 0.8 : 0.84),
          backdropFilter: 'blur(24px)',
          boxShadow: `0 18px 42px ${alpha(muiTheme.palette.common.black, muiTheme.palette.mode === 'dark' ? 0.28 : 0.08)}`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 72, sm: 84 }, px: { xs: 1.5, sm: 2.25 } }}>
          <Tooltip title={t('topbar.toggleNavigation')}>
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
                {t('layout.brand')}
              </Typography>
              <Chip
                icon={<SyncIcon sx={{ fontSize: 16 }} />}
                label={refreshInterval === 0 ? t('common.manualRefresh') : t('topbar.liveSync')}
                size="small"
                color={refreshInterval === 0 ? 'default' : 'primary'}
                variant="outlined"
              />
            </Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              {t(pageMeta.titleKey)}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {t(pageMeta.subtitleKey)}
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
            <Chip
              icon={<TranslateIcon sx={{ fontSize: 16 }} />}
              label={t(localeLabelKey)}
              onClick={handleLocaleMenuOpen}
              variant="outlined"
              sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
            />
            <Tooltip title={t('topbar.languageMenu')}>
              <IconButton
                onClick={handleLocaleMenuOpen}
                sx={{
                  display: { xs: 'inline-flex', lg: 'none' },
                  backgroundColor: alpha(muiTheme.palette.secondary.main, 0.12),
                  color: 'secondary.main',
                }}
              >
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === 'dark' ? t('topbar.switchToLight') : t('topbar.switchToDark')}>
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
            <Tooltip title={t('topbar.refreshNow')}>
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
              {t('topbar.refreshOneSecond')}
            </MenuItem>
            <MenuItem selected={refreshInterval === 3000} onClick={() => handleRefreshIntervalChange(3000)}>
              {t('topbar.refreshThreeSeconds')}
            </MenuItem>
            <MenuItem selected={refreshInterval === 5000} onClick={() => handleRefreshIntervalChange(5000)}>
              {t('topbar.refreshFiveSeconds')}
            </MenuItem>
            <MenuItem selected={refreshInterval === 10000} onClick={() => handleRefreshIntervalChange(10000)}>
              {t('topbar.refreshTenSeconds')}
            </MenuItem>
            <MenuItem selected={refreshInterval === 0} onClick={() => handleRefreshIntervalChange(0)}>
              {t('common.manualRefresh')}
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={localeMenuAnchor}
            open={Boolean(localeMenuAnchor)}
            onClose={handleLocaleMenuClose}
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
            {localeOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={locale === option.value}
                onClick={() => {
                  setLocale(option.value)
                  handleLocaleMenuClose()
                }}
              >
                {t(`locale.${option.labelKey}`)}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Paper>
    </Box>
  )
}
