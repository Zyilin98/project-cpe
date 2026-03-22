import { useState } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { Router, Visibility, VisibilityOff } from '@mui/icons-material'
import { getSensitiveStyle } from '../utils'
import type { DeviceInfo, SystemStatsResponse } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface DeviceInfoCardProps {
  deviceInfo: DeviceInfo | null
  systemStats: SystemStatsResponse | null
}

export function DeviceInfoCard({ deviceInfo, systemStats }: DeviceInfoCardProps) {
  const [showInfo, setShowInfo] = useState(false)

  const items = [
    { label: 'IMEI', value: deviceInfo?.imei || 'N/A', sensitive: true },
    { label: 'Manufacturer', value: deviceInfo?.manufacturer || 'N/A' },
    { label: 'Model', value: deviceInfo?.model || 'N/A' },
    { label: 'System', value: `${systemStats?.system_info?.sysname || '-'} / ${systemStats?.system_info?.machine || '-'}` },
    { label: 'Kernel', value: systemStats?.system_info?.release || '-' },
  ]

  return (
    <DashboardPanel
      title="Device Identity"
      subtitle="Hardware and operating system fingerprint"
      icon={<Router color="primary" />}
      action={(
        <Tooltip title={showInfo ? 'Hide IMEI' : 'Show IMEI'}>
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
