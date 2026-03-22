import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useRefreshInterval } from '@/contexts/RefreshContext'
import ErrorSnackbar from '@/components/ErrorSnackbar'
import { useDashboardData } from './hooks/useDashboardData'
import {
  StatusOverview,
  QuickControls,
  SystemResources,
  NetworkSpeed,
  ConnectionStatus,
  SimCardInfo,
  TemperatureMonitor,
  CellInfo,
  DeviceInfoCard,
} from './components'

export default function Dashboard() {
  const { refreshInterval, refreshKey } = useRefreshInterval()
  const { initialLoading, error, setError, data, actions } = useDashboardData(refreshInterval, refreshKey)

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <ErrorSnackbar error={error} onClose={() => setError(null)} />

      <Stack spacing={1} sx={{ mb: 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Live overview
            </Typography>
            <Typography variant="h4">Dashboard</Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={refreshInterval === 0 ? 'Manual refresh' : `Auto refresh ${refreshInterval / 1000}s`}
              variant="outlined"
            />
            <Chip label={`Refresh key ${refreshKey}`} variant="outlined" />
          </Stack>
        </Box>
        <Typography variant="body1" color="text.secondary">
          A control-room view of carrier state, system load and live traffic for the current modem session.
        </Typography>
      </Stack>

      <StatusOverview
        deviceInfo={data.deviceInfo}
        networkInfo={data.networkInfo}
        cellsInfo={data.cellsInfo}
        airplaneMode={data.airplaneMode}
        imsStatus={data.imsStatus}
        roaming={data.roaming}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <QuickControls
            dataStatus={data.dataStatus}
            airplaneMode={data.airplaneMode}
            roaming={data.roaming}
            onToggleData={() => void actions.toggleData()}
            onToggleAirplaneMode={() => void actions.toggleAirplaneMode()}
            onToggleRoaming={() => void actions.toggleRoaming()}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ConnectionStatus
            qosInfo={data.qosInfo}
            connectivity={data.connectivity}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SimCardInfo simInfo={data.simInfo} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SystemResources systemStats={data.systemStats} />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <NetworkSpeed
            systemStats={data.systemStats}
            speedHistory={data.speedHistory}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TemperatureMonitor systemStats={data.systemStats} />
        </Grid>

        <Grid size={12}>
          <CellInfo cellsInfo={data.cellsInfo} />
        </Grid>

        <Grid size={12}>
          <DeviceInfoCard
            deviceInfo={data.deviceInfo}
            systemStats={data.systemStats}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
