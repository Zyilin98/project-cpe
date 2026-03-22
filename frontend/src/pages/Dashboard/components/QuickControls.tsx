import { Box, Chip, Stack, Switch, Typography } from '@mui/material'
import { FlightTakeoff, NetworkCheck, TravelExplore } from '@mui/icons-material'
import type { AirplaneModeResponse, RoamingResponse } from '@/api/types'
import { useI18n } from '@/contexts/I18nContext'
import { DashboardPanel } from './DashboardPanel'

interface QuickControlsProps {
  dataStatus: boolean
  airplaneMode: AirplaneModeResponse | null
  roaming: RoamingResponse | null
  onToggleData: () => void
  onToggleAirplaneMode: () => void
  onToggleRoaming: () => void
}

export function QuickControls({
  dataStatus,
  airplaneMode,
  roaming,
  onToggleData,
  onToggleAirplaneMode,
  onToggleRoaming,
}: QuickControlsProps) {
  const { t } = useI18n()
  const controls = [
    {
      key: 'data',
      icon: <NetworkCheck color={dataStatus ? 'success' : 'disabled'} />,
      title: t('dashboard.quickControls.mobileData'),
      description: dataStatus ? t('dashboard.quickControls.mobileDataActive') : t('dashboard.quickControls.mobileDataPaused'),
      checked: dataStatus,
      color: 'success' as const,
      onChange: onToggleData,
    },
    {
      key: 'roaming',
      icon: <TravelExplore color={roaming?.roaming_allowed ? 'info' : 'disabled'} />,
      title: t('dashboard.quickControls.dataRoaming'),
      description: roaming?.is_roaming ? t('dashboard.quickControls.roamingDetected') : t('dashboard.quickControls.roamingPolicy'),
      checked: roaming?.roaming_allowed || false,
      color: 'info' as const,
      onChange: onToggleRoaming,
      badge: roaming?.is_roaming ? t('dashboard.quickControls.roamingBadge') : undefined,
    },
    {
      key: 'flight',
      icon: <FlightTakeoff color={airplaneMode?.enabled ? 'warning' : 'disabled'} />,
      title: t('dashboard.quickControls.airplaneMode'),
      description: airplaneMode?.enabled ? t('dashboard.quickControls.radioMuted') : t('dashboard.quickControls.radioOnline'),
      checked: airplaneMode?.enabled || false,
      color: 'warning' as const,
      onChange: onToggleAirplaneMode,
    },
  ]

  return (
    <DashboardPanel
      title={t('dashboard.quickControls.title')}
      subtitle={t('dashboard.quickControls.subtitle')}
      icon={<NetworkCheck color="primary" />}
    >
      <Stack spacing={1.25}>
        {controls.map((control) => (
          <Box
            key={control.key}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              px: 1.5,
              py: 1.25,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            })}
          >
            <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
              {control.icon}
              <Box minWidth={0}>
                <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
                  <Typography variant="body2" fontWeight={600}>
                    {control.title}
                  </Typography>
                  {control.badge && <Chip label={control.badge} size="small" color="warning" variant="outlined" />}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {control.description}
                </Typography>
              </Box>
            </Box>
            <Switch checked={control.checked} onChange={control.onChange} color={control.color} />
          </Box>
        ))}
      </Stack>
    </DashboardPanel>
  )
}
