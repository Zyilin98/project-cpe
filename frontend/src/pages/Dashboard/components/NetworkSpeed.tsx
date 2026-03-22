import { Box, Chip, Stack, Typography, useTheme, type Theme } from '@mui/material'
import { alpha } from '@/utils/theme'
import { ArrowDownward, ArrowUpward, Speed } from '@mui/icons-material'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { formatBytes, formatSpeed } from '../utils'
import { SPEED_HISTORY_MAX_POINTS, type InterfaceSpeedHistory } from '../hooks/useDashboardData'
import type { SystemStatsResponse } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface NetworkSpeedProps {
  systemStats: SystemStatsResponse | null
  speedHistory: Record<string, InterfaceSpeedHistory>
}

export function NetworkSpeed({ systemStats, speedHistory }: NetworkSpeedProps) {
  const theme = useTheme<Theme>()

  return (
    <DashboardPanel
      title="Live Traffic"
      subtitle="Per-interface throughput and rolling transfer history"
      icon={<Speed color="primary" />}
      action={<Chip label={`${SPEED_HISTORY_MAX_POINTS}s window`} variant="outlined" size="small" />}
    >
      {systemStats?.network_speed?.interfaces && systemStats.network_speed.interfaces.length > 0 ? (
        <Stack spacing={1.5}>
          {systemStats.network_speed.interfaces.map((iface) => {
            const history = speedHistory[iface.interface]
            const rxData = history?.rx || []
            const txData = history?.tx || []
            const maxSpeed = Math.max(Math.max(...rxData, 1), Math.max(...txData, 1))

            return (
              <Box
                key={iface.interface}
                sx={{
                  p: 1.5,
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.74 : 0.9),
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={1.25} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label={iface.interface} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                    <Typography variant="caption" color="text.secondary">
                      Totals {formatBytes(iface.total_rx_bytes)} down / {formatBytes(iface.total_tx_bytes)} up
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.25} flexWrap="wrap">
                    <Chip icon={<ArrowDownward />} label={formatSpeed(iface.rx_bytes_per_sec)} color="success" />
                    <Chip icon={<ArrowUpward />} label={formatSpeed(iface.tx_bytes_per_sec)} color="primary" />
                  </Box>
                </Box>

                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Download
                    </Typography>
                    {rxData.length > 1 ? (
                      <Box sx={{ height: 54 }}>
                        <SparkLineChart
                          data={rxData}
                          height={54}
                          area
                          curve="natural"
                          color={theme.palette.success.main}
                          yAxis={{ min: 0, max: maxSpeed * 1.1 }}
                          margin={{ top: 4, bottom: 4, left: 0, right: 0 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Collecting traffic samples...
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Upload
                    </Typography>
                    {txData.length > 1 ? (
                      <Box sx={{ height: 54 }}>
                        <SparkLineChart
                          data={txData}
                          height={54}
                          area
                          curve="natural"
                          color={theme.palette.primary.main}
                          yAxis={{ min: 0, max: maxSpeed * 1.1 }}
                          margin={{ top: 4, bottom: 4, left: 0, right: 0 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Collecting traffic samples...
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No traffic interfaces available right now.
        </Typography>
      )}
    </DashboardPanel>
  )
}
