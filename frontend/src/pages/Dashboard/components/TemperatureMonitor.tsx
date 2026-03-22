import { Box, Chip, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Thermostat } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import { getTempColor } from '../utils'
import type { SystemStatsResponse } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface TemperatureMonitorProps {
  systemStats: SystemStatsResponse | null
}

export function TemperatureMonitor({ systemStats }: TemperatureMonitorProps) {
  const { t } = useI18n()
  const sensors = systemStats?.temperature || []
  const averageTemp = sensors.length > 0
    ? sensors.reduce((sum, sensor) => sum + sensor.temperature, 0) / sensors.length
    : null

  return (
    <DashboardPanel
      title={t('dashboard.thermal.title')}
      subtitle={t('dashboard.thermal.subtitle')}
      icon={<Thermostat color="primary" />}
      action={averageTemp !== null ? (
        <Chip label={t('dashboard.thermal.average', { value: averageTemp.toFixed(1) })} color={getTempColor(averageTemp)} />
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
                  {t('dashboard.thermal.value', { value: sensor.temperature.toFixed(1) })}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.thermal.noSensors')}
        </Typography>
      )}
    </DashboardPanel>
  )
}
