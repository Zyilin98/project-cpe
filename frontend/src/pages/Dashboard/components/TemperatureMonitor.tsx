import { Box, Chip, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Thermostat } from '@mui/icons-material'
import { getTempColor } from '../utils'
import type { SystemStatsResponse } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface TemperatureMonitorProps {
  systemStats: SystemStatsResponse | null
}

export function TemperatureMonitor({ systemStats }: TemperatureMonitorProps) {
  const sensors = systemStats?.temperature || []
  const averageTemp = sensors.length > 0
    ? sensors.reduce((sum, sensor) => sum + sensor.temperature, 0) / sensors.length
    : null

  return (
    <DashboardPanel
      title="Thermal Monitor"
      subtitle="Sensor snapshots across the device"
      icon={<Thermostat color="primary" />}
      action={averageTemp !== null ? (
        <Chip label={`Avg ${averageTemp.toFixed(1)} deg C`} color={getTempColor(averageTemp)} />
      ) : undefined}
    >
      {sensors.length > 0 ? (
        <Grid container spacing={1.25}>
          {sensors.map((sensor) => (
            <Grid size={{ xs: 6, sm: 4 }} key={sensor.type}>
              <Box
                sx={(theme) => ({
                  p: 1.25,
                  borderRadius: 4,
                  textAlign: 'center',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'background.paper',
                })}
              >
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {sensor.type}
                </Typography>
                <Typography variant="h6" color={`${getTempColor(sensor.temperature)}.main`} sx={{ mt: 0.5 }}>
                  {sensor.temperature.toFixed(1)} deg
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No temperature sensors reported by the backend.
        </Typography>
      )}
    </DashboardPanel>
  )
}
