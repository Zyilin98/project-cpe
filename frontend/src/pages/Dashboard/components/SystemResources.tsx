import { Box, Chip, LinearProgress, Stack, Tooltip, Typography } from '@mui/material'
import { Info, Memory, Speed, Storage, Thermostat, Usb } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import { formatBytes, getCpuColor, getMemoryColor, getTempColor } from '../utils'
import type { SystemStatsResponse } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface SystemResourcesProps {
  systemStats: SystemStatsResponse | null
}

export function SystemResources({ systemStats }: SystemResourcesProps) {
  const { t } = useI18n()
  const getMainTemp = () => {
    if (systemStats?.temperature && systemStats.temperature.length > 0) {
      const socSensor = systemStats.temperature.find((sensor) => sensor.type.includes('soc'))
      return socSensor?.temperature || systemStats.temperature[0].temperature
    }
    return null
  }

  const mainTemp = getMainTemp()

  return (
    <DashboardPanel
      title={t('dashboard.resources.title')}
      subtitle={t('dashboard.resources.subtitle')}
      icon={<Speed color="primary" />}
    >
      <Stack spacing={1.5}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Speed fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {t('dashboard.resources.cpu', { cores: systemStats?.cpu_load?.core_count || '-' })}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {systemStats?.cpu_load ? `${systemStats.cpu_load.load_percent.toFixed(0)}%` : '-'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={systemStats?.cpu_load?.load_percent || 0}
            color={getCpuColor(systemStats?.cpu_load?.load_percent || 0)}
            sx={{ height: 8 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            {t('dashboard.resources.load', {
              one: systemStats?.cpu_load?.load_1min.toFixed(2) || '-',
              five: systemStats?.cpu_load?.load_5min.toFixed(2) || '-',
              fifteen: systemStats?.cpu_load?.load_15min.toFixed(2) || '-',
            })}
          </Typography>
        </Box>

        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Memory fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {t('dashboard.resources.memory')}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {systemStats?.memory ? `${systemStats.memory.used_percent.toFixed(0)}%` : '-'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={systemStats?.memory?.used_percent || 0}
            color={getMemoryColor(systemStats?.memory?.used_percent || 0)}
            sx={{ height: 8 }}
          />
          {systemStats?.memory && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
              {t('dashboard.resources.memoryUsage', {
                used: formatBytes(systemStats.memory.used_bytes),
                available: formatBytes(systemStats.memory.available_bytes),
                cached: formatBytes(systemStats.memory.cached_bytes),
              })}
            </Typography>
          )}
        </Box>

        {systemStats?.disk && systemStats.disk.length > 0 && (
          <Stack spacing={0.9}>
            {systemStats.disk.slice(0, 2).map((disk) => (
              <Box
                key={disk.mount_point}
                sx={(theme) => ({
                  px: 1.25,
                  py: 1.1,
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'background.paper',
                })}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Storage fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {disk.mount_point}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={600}>
                    {disk.used_percent.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={disk.used_percent}
                  color={getMemoryColor(disk.used_percent)}
                  sx={{ height: 6 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {formatBytes(disk.used_bytes)} / {formatBytes(disk.total_bytes)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Chip
            icon={<Thermostat />}
            label={mainTemp !== null ? `${mainTemp.toFixed(0)} °C` : t('dashboard.resources.noTemp')}
            color={mainTemp !== null ? getTempColor(mainTemp) : 'default'}
          />
          <Chip
            icon={<Usb />}
            label={systemStats?.usb_mode?.current_mode_name || t('dashboard.resources.usbNa')}
            variant="outlined"
          />
          {systemStats?.usb_mode?.needs_reboot && (
            <Tooltip title={t('dashboard.resources.rebootTooltip')}>
              <Chip icon={<Info />} label={t('dashboard.resources.rebootPending')} color="warning" variant="outlined" />
            </Tooltip>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {t('dashboard.resources.uptime', { value: systemStats?.uptime?.uptime_formatted || '-' })}
        </Typography>
      </Stack>
    </DashboardPanel>
  )
}
