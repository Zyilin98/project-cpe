import { Box, Chip, Paper, Stack, Typography, useTheme, type Theme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { alpha } from '@/utils/theme'
import {
  FlightTakeoff,
  PowerSettingsNew,
  Router,
  SignalCellularAlt,
  TravelExplore,
  WifiTethering,
} from '@mui/icons-material'
import { formatCarrierName, getCarrierLogo } from '@/utils/carriers'
import { getSignalColor } from '../utils'
import type {
  AirplaneModeResponse,
  CellsResponse,
  DeviceInfo,
  ImsStatusResponse,
  NetworkInfo,
  RoamingResponse,
} from '@/api/types'

interface StatusOverviewProps {
  deviceInfo: DeviceInfo | null
  networkInfo: NetworkInfo | null
  cellsInfo: CellsResponse | null
  airplaneMode: AirplaneModeResponse | null
  imsStatus: ImsStatusResponse | null
  roaming?: RoamingResponse | null
}

export function StatusOverview({
  deviceInfo,
  networkInfo,
  cellsInfo,
  airplaneMode,
  imsStatus,
  roaming,
}: StatusOverviewProps) {
  const theme = useTheme<Theme>()

  const carrierName = formatCarrierName(networkInfo?.mcc, networkInfo?.mnc)
  const carrierLogo = getCarrierLogo(networkInfo?.mcc, networkInfo?.mnc)
  const signalStrength = networkInfo?.signal_strength || 0
  const signalColor = getSignalColor(signalStrength)

  const getNetworkTech = () => {
    if (cellsInfo?.serving_cell?.tech) {
      return cellsInfo.serving_cell.tech.toUpperCase()
    }
    if (networkInfo?.technology_preference) {
      if (networkInfo.technology_preference.includes('NR')) return '5G'
      if (networkInfo.technology_preference.includes('LTE')) return 'LTE'
    }
    return 'N/A'
  }

  const metrics = [
    {
      label: 'Technology',
      value: getNetworkTech(),
      icon: <WifiTethering fontSize="small" color="primary" />,
    },
    {
      label: 'Registration',
      value:
        networkInfo?.registration_status === 'registered'
          ? 'Registered'
          : networkInfo?.registration_status === 'roaming'
            ? 'Roaming'
            : networkInfo?.registration_status || 'Unknown',
      icon: <Router fontSize="small" color="primary" />,
    },
    {
      label: 'Modem',
      value: deviceInfo?.online ? 'Online' : 'Offline',
      icon: <PowerSettingsNew fontSize="small" color="primary" />,
    },
    {
      label: 'Serving Cell',
      value: cellsInfo?.serving_cell?.cell_id || 'N/A',
      icon: <SignalCellularAlt fontSize="small" color="primary" />,
    },
  ]

  return (
    <Paper
      sx={{
        mb: 2.5,
        p: { xs: 2.5, md: 3 },
        borderRadius: { xs: 5, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.12)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.88 : 0.94)} 48%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)} 100%)`,
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 'auto -15% -40% auto',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.26)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" gap={3} flexWrap="wrap" position="relative" zIndex={1}>
        <Stack spacing={1.25} sx={{ minWidth: 0, flex: '1 1 420px' }}>
          <Typography variant="overline" color="text.secondary">
            Modem status
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {carrierLogo ? (
              <Box component="img" src={carrierLogo} alt={carrierName} sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            ) : null}
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.6rem' } }}>
              {carrierName}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {deviceInfo?.manufacturer || 'Unknown device'} {deviceInfo?.model || ''} · {networkInfo?.operator_name || 'Carrier unavailable'}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={getNetworkTech()} color={getNetworkTech() === '5G' || getNetworkTech() === 'NR' ? 'success' : 'primary'} />
            {imsStatus?.registered && <Chip label="VoLTE ready" color="info" variant="outlined" />}
            {airplaneMode?.enabled && <Chip icon={<FlightTakeoff />} label="Airplane mode" color="warning" variant="outlined" />}
            {roaming?.is_roaming && (
              <Chip
                icon={<TravelExplore />}
                label={roaming.roaming_allowed ? 'Roaming enabled' : 'Roaming blocked'}
                color={roaming.roaming_allowed ? 'info' : 'error'}
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>

        <Box
          sx={{
            minWidth: { xs: '100%', sm: 220 },
            flex: '0 1 260px',
            alignSelf: 'stretch',
            p: 2,
            borderRadius: 5,
            backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.62 : 0.72),
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Signal quality
          </Typography>
          <Box display="flex" alignItems="flex-end" gap={1} mt={1}>
            <SignalCellularAlt sx={{ color: `${signalColor}.main`, fontSize: 30 }} />
            <Typography variant="h2" color={`${signalColor}.main`} sx={{ lineHeight: 1 }}>
              {signalStrength}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 0.4 }}>
              %
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {(networkInfo?.mcc && networkInfo?.mnc) ? `${networkInfo.mcc}-${networkInfo.mnc}` : 'No operator code'} · {networkInfo?.technology_preference || 'No preference'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={1.25} sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.88)}`,
                backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.56 : 0.72),
              }}
            >
              <Box display="flex" alignItems="center" gap={0.75} mb={1}>
                {metric.icon}
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={700} noWrap>
                {metric.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
