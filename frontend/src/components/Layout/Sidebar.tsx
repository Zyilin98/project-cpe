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

interface SidebarProps {
  drawerWidth: number
  mobileOpen: boolean
  desktopOpen: boolean
  onClose: () => void
  isMobile: boolean
}

const menuGroups = [
  {
    title: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', hint: 'Live overview', icon: DashboardIcon },
      { path: '/device', label: 'Device Info', hint: 'Hardware profile', icon: DevicesIcon },
      { path: '/network', label: 'Network', hint: 'Radio and carrier', icon: SignalIcon },
    ],
  },
  {
    title: 'Communication',
    items: [
      { path: '/phone', label: 'Phone', hint: 'Calls and audio', icon: PhoneIcon },
      { path: '/sms', label: 'SMS', hint: 'Inbox and send', icon: SmsIcon },
    ],
  },
  {
    title: 'Control',
    items: [
      { path: '/config', label: 'Configuration', hint: 'Policies and system', icon: SettingsIcon },
      { path: '/ota', label: 'OTA Update', hint: 'Firmware staging', icon: OtaIcon },
      { path: '/at-console', label: 'AT Console', hint: 'Direct modem commands', icon: TerminalIcon },
      { path: '/terminal', label: 'Web Terminal', hint: 'Remote shell', icon: WebTerminalIcon },
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
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
          background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.42 : 0.84)} 100%)`,
          mb: 2,
        })}
      >
        <Stack spacing={1.5}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Control Surface
              </Typography>
              <Typography variant="h6">UDX710</Typography>
            </Box>
            <Chip label="Online" color="success" size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Expressive control deck for modem, radio and system management.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`v${__APP_VERSION__}`} size="small" variant="outlined" />
            <Chip label={__GIT_BRANCH__} size="small" variant="outlined" />
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {menuGroups.map((group) => (
          <Box key={group.title}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ px: 1.5, display: 'block', mb: 0.5 }}
            >
              {group.title}
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
                        borderRadius: 5,
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
                        primary={item.label}
                        secondary={item.hint}
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
            1orz/project-cpe
          </Typography>
        </Link>
        <Link
          href="https://github.com/zyilin98/project-cpe"
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
            zyilin98/project-cpe
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
