import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useMediaQuery, useTheme, type Theme } from '@mui/material'
import { alpha } from '@/utils/theme'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { RefreshContext } from '../../contexts/RefreshContext'

const DRAWER_WIDTH = 296

export default function MainLayout() {
  const theme = useTheme<Theme>()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(3000)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setDesktopOpen(!desktopOpen)
    }
  }

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <RefreshContext.Provider
      value={{ refreshInterval, setRefreshInterval, refreshKey, triggerRefresh }}
    >
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <TopBar
          drawerWidth={desktopOpen ? DRAWER_WIDTH : 0}
          onMenuClick={handleDrawerToggle}
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
        />

        <Sidebar
          drawerWidth={DRAWER_WIDTH}
          mobileOpen={mobileOpen}
          desktopOpen={desktopOpen}
          onClose={handleDrawerToggle}
          isMobile={isMobile}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: {
              xs: '100%',
              sm: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
            },
            px: { xs: 2, sm: 3, lg: 4 },
            pt: { xs: 14, sm: 16 },
            pb: { xs: 3, sm: 4 },
            minHeight: '100vh',
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Box
            sx={{
              mx: 'auto',
              width: '100%',
              maxWidth: 1560,
              minHeight: 'calc(100vh - 140px)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-40px -24px auto',
                height: 220,
                borderRadius: 8,
                background: `radial-gradient(circle at top center, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 68%)`,
                pointerEvents: 'none',
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </RefreshContext.Provider>
  )
}
