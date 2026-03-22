import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@/utils/theme'
import {
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  SignalCellularAlt as SignalIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Phone as PhoneIcon,
  Sms as SmsIcon,
  GitHub as GitHubIcon,
  WebAsset as WebTerminalIcon,
  SystemUpdateAlt as OtaIcon,
} from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'

interface SidebarProps {
  drawerWidth: number
  mobileOpen: boolean
  desktopOpen: boolean
  onClose: () => void
  isMobile: boolean
}

const menuGroups = [
  {
    titleKey: 'layout.groups.overview',
    items: [
      { path: '/', labelKey: 'layout.items.dashboard.label', hintKey: 'layout.items.dashboard.hint', icon: DashboardIcon },
      { path: '/device', labelKey: 'layout.items.device.label', hintKey: 'layout.items.device.hint', icon: DevicesIcon },
      { path: '/network', labelKey: 'layout.items.network.label', hintKey: 'layout.items.network.hint', icon: SignalIcon },
    ],
  },
  {
    titleKey: 'layout.groups.communication',
    items: [
      { path: '/phone', labelKey: 'layout.items.phone.label', hintKey: 'layout.items.phone.hint', icon: PhoneIcon },
      { path: '/sms', labelKey: 'layout.items.sms.label', hintKey: 'layout.items.sms.hint', icon: SmsIcon },
    ],
  },
  {
    titleKey: 'layout.groups.control',
    items: [
      { path: '/config', labelKey: 'layout.items.configuration.label', hintKey: 'layout.items.configuration.hint', icon: SettingsIcon },
      { path: '/ota', labelKey: 'layout.items.ota.label', hintKey: 'layout.items.ota.hint', icon: OtaIcon },
      { path: '/at-console', labelKey: 'layout.items.atConsole.label', hintKey: 'layout.items.atConsole.hint', icon: TerminalIcon },
      { path: '/terminal', labelKey: 'layout.items.terminal.label', hintKey: 'layout.items.terminal.hint', icon: WebTerminalIcon },
    ],
  },
]

export default function Sidebar({
  drawerWidth,
  mobileOpen,
  desktopOpen,
  onClose,
  isMobile,
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname.startsWith(path)
  }

  const handleNavigation = (path: string): void => {
    void navigate(path)
    if (isMobile) {
      onClose()
    }
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.5 }}>
      <Box
        sx={(theme) => ({
          p: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
          background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.42 : 0.84)} 100%)`,
          mb: 2,
        })}
      >
        <Stack spacing={1.5}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {t('layout.summaryEyebrow')}
              </Typography>
              <Typography variant="h6">UDX710</Typography>
            </Box>
            <Chip label={t('common.online')} color="success" size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('layout.summaryDescription')}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`v${__APP_VERSION__}`} size="small" variant="outlined" />
            <Chip label={__GIT_BRANCH__} size="small" variant="outlined" />
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {menuGroups.map((group) => (
          <Box key={group.titleKey}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ px: 1.5, display: 'block', mb: 0.5 }}
            >
              {t(group.titleKey)}
            </Typography>
            <List sx={{ p: 0 }}>
              {group.items.map((item) => {
                const IconComponent = item.icon

                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isActive(item.path)}
                      onClick={() => handleNavigation(item.path)}
                      sx={(theme) => ({
                        minHeight: 56,
                        borderRadius: 2.5,
                        px: 1.5,
                        alignItems: 'center',
                        transition: theme.transitions.create(['background-color', 'transform']),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                          transform: 'translateX(2px)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.14),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                          boxShadow: `0 14px 26px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.1)}`,
                        },
                        '&.Mui-selected:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.18),
                        },
                      })}
                    >
                      <ListItemIcon
                        sx={(theme) => ({
                          minWidth: 42,
                          color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                        })}
                      >
                        <IconComponent />
                      </ListItemIcon>
                      <ListItemText
                        primary={t(item.labelKey)}
                        secondary={t(item.hintKey)}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        ))}
      </Stack>

      <Box sx={{ p: 1.5, mt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Link
          href="https://github.com/1orz/project-cpe"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.75rem',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <GitHubIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="inherit" fontWeight={600}>
            {t('layout.repoLabel1')}
          </Typography>
        </Link>
        <Link
          href="https://github.com/Zyilin98/project-cpe"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.75rem',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <GitHubIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="inherit" fontWeight={600}>
            {t('layout.repoLabel2')}
          </Typography>
        </Link>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          v{__APP_VERSION__} ({__GIT_BRANCH__}/{__GIT_COMMIT__})
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Copyright 2026 1orz, Zyilin98
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{
        width: { xs: 0, sm: desktopOpen ? drawerWidth : 0 },
        flexShrink: { sm: 0 },
        transition: 'width 0.3s',
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            p: 0.5,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: 'transform 0.3s',
            p: 0.5,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  )
}
