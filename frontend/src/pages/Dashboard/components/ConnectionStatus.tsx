import { Box, Chip, Stack, Typography } from '@mui/material'
import { Router, Wifi } from '@mui/icons-material'
import type { QosInfo } from '@/api/types'
import { useI18n } from '@/contexts/I18nContext'
import type { ConnectivityResult } from '../hooks/useDashboardData'
import { DashboardPanel } from './DashboardPanel'

interface ConnectionStatusProps {
  qosInfo: QosInfo | null
  connectivity: ConnectivityResult | null
}

export function ConnectionStatus({ qosInfo, connectivity }: ConnectionStatusProps) {
  const { t } = useI18n()
  const metrics = [
    {
      label: t('dashboard.connection.qci'),
      value: qosInfo?.qci || '-',
    },
    {
      label: t('dashboard.connection.downlink'),
      value: qosInfo?.dl_speed ? `${(qosInfo.dl_speed / 1000).toFixed(0)} Mbps` : '-',
    },
    {
      label: t('dashboard.connection.uplink'),
      value: qosInfo?.ul_speed ? `${(qosInfo.ul_speed / 1000).toFixed(0)} Mbps` : '-',
    },
  ]

  return (
    <DashboardPanel
      title={t('dashboard.connection.title')}
      subtitle={t('dashboard.connection.subtitle')}
      icon={<Router color="primary" />}
    >
      <Stack spacing={1.5}>
        <Box display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap={1}>
          {metrics.map((metric) => (
            <Box
              key={metric.label}
              sx={(theme) => ({
                p: 1.25,
                borderRadius: 4,
                backgroundColor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
              })}
            >
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                {metric.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={(theme) => ({
            p: 1.5,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
          })}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Wifi color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {t('dashboard.connection.reachability')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={connectivity?.ipv4?.success ? t('dashboard.connection.latency', { version: 'IPv4', value: connectivity.ipv4.latency_ms?.toFixed(0) || '-' }) : t('dashboard.connection.offline', { version: 'IPv4' })}
              color={connectivity?.ipv4?.success ? 'success' : 'error'}
              variant="outlined"
            />
            <Chip
              label={connectivity?.ipv6?.success ? t('dashboard.connection.latency', { version: 'IPv6', value: connectivity.ipv6.latency_ms?.toFixed(0) || '-' }) : t('dashboard.connection.offline', { version: 'IPv6' })}
              color={connectivity?.ipv6?.success ? 'success' : 'error'}
              variant="outlined"
            />
          </Stack>
        </Box>
      </Stack>
    </DashboardPanel>
  )
}
