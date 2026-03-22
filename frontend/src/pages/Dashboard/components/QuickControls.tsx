import { Box, Chip, Stack, Switch, Typography } from '@mui/material'
import { FlightTakeoff, NetworkCheck, TravelExplore } from '@mui/icons-material'
import type { AirplaneModeResponse, RoamingResponse } from '@/api/types'
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
  const controls = [
    {
      key: 'data',
      icon: <NetworkCheck color={dataStatus ? 'success' : 'disabled'} />,
      title: '鏁版嵁杩炴帴',
      description: dataStatus ? 'Mobile data path is active' : 'Cellular data is paused',
      checked: dataStatus,
      color: 'success' as const,
      onChange: onToggleData,
    },
    {
      key: 'roaming',
      icon: <TravelExplore color={roaming?.roaming_allowed ? 'info' : 'disabled'} />,
      title: '婕父鏁版嵁',
      description: roaming?.is_roaming ? 'Roaming session detected' : 'Roaming follows policy',
      checked: roaming?.roaming_allowed || false,
      color: 'info' as const,
      onChange: onToggleRoaming,
      badge: roaming?.is_roaming ? 'Roaming' : undefined,
    },
    {
      key: 'flight',
      icon: <FlightTakeoff color={airplaneMode?.enabled ? 'warning' : 'disabled'} />,
      title: '椋炶妯″紡',
      description: airplaneMode?.enabled ? 'Radio stack is muted' : 'Radio stack is online',
      checked: airplaneMode?.enabled || false,
      color: 'warning' as const,
      onChange: onToggleAirplaneMode,
    },
  ]

  return (
    <DashboardPanel
      title="Quick Controls"
      subtitle="Fast actions for radio policy and data behavior"
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
                  {control.badge && (
                    <Chip label={control.badge} size="small" color="warning" variant="outlined" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {control.description}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={control.checked}
              onChange={control.onChange}
              color={control.color}
            />
          </Box>
        ))}
      </Stack>
    </DashboardPanel>
  )
}
