import { useState } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { Router, Visibility, VisibilityOff } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import { getSensitiveStyle } from '../utils'
import type { DeviceInfo, SystemStatsResponse } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface DeviceInfoCardProps {
  deviceInfo: DeviceInfo | null
  systemStats: SystemStatsResponse | null
}

export function DeviceInfoCard({ deviceInfo, systemStats }: DeviceInfoCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const { t } = useI18n()

  const items = [
    { label: 'IMEI', value: deviceInfo?.imei || 'N/A', sensitive: true },
    { label: t('dashboard.device.manufacturer'), value: deviceInfo?.manufacturer || 'N/A' },
    { label: t('dashboard.device.model'), value: deviceInfo?.model || 'N/A' },
    { label: t('dashboard.device.system'), value: `${systemStats?.system_info?.sysname || '-'} / ${systemStats?.system_info?.machine || '-'}` },
    { label: t('dashboard.device.kernel'), value: systemStats?.system_info?.release || '-' },
  ]

  return (
    <DashboardPanel
      title={t('dashboard.device.title')}
      subtitle={t('dashboard.device.subtitle')}
      icon={<Router color="primary" />}
      action={(
        <Tooltip title={showInfo ? t('dashboard.device.hideImei') : t('dashboard.device.showImei')}>
          <IconButton size="small" onClick={() => setShowInfo(!showInfo)}>
            {showInfo ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
          gap: 1.25,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.label}
            sx={(theme) => ({
              p: 1.25,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            })}
          >
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.75,
                fontWeight: 600,
                fontFamily: item.sensitive ? 'monospace' : 'inherit',
                ...getSensitiveStyle(item.sensitive ? showInfo : true),
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </DashboardPanel>
  )
}
