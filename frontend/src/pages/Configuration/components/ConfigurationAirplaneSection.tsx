import type { SyntheticEvent } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import { ExpandMore, FlightTakeoff } from '@mui/icons-material'
import type { AirplaneModeResponse } from '../../../api/types'
import ConfigurationSectionHeader from './ConfigurationSectionHeader'

interface ConfigurationAirplaneSectionProps {
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
  airplaneMode: AirplaneModeResponse | null
  airplaneSwitching: boolean
  onToggle: () => void
}

export default function ConfigurationAirplaneSection({
  expanded,
  onChange,
  airplaneMode,
  airplaneSwitching,
  onToggle,
}: ConfigurationAirplaneSectionProps) {
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<FlightTakeoff color={airplaneMode?.enabled ? 'warning' : 'primary'} />}
          title="Airplane Mode"
          statusLabel={airplaneMode?.enabled ? 'On' : 'Off'}
          statusColor={airplaneMode?.enabled ? 'warning' : 'default'}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          Airplane mode powers the radio stack down and prevents the modem from attaching to the mobile network.
          USB connectivity remains available while the radio is offline.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={airplaneMode?.enabled || false}
              onChange={onToggle}
              disabled={airplaneSwitching}
              color="warning"
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={1}>
              {airplaneSwitching && <CircularProgress size={16} />}
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {airplaneMode?.enabled ? 'Airplane mode is enabled' : 'Airplane mode is disabled'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {airplaneMode?.enabled ? 'The modem radio is offline' : 'The modem radio is active'}
                </Typography>
              </Box>
            </Box>
          }
        />

        <Box mt={2} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current modem state
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`Power: ${airplaneMode?.powered ? 'On' : 'Off'}`}
              size="small"
              color={airplaneMode?.powered ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              label={`Radio: ${airplaneMode?.online ? 'Online' : 'Offline'}`}
              size="small"
              color={airplaneMode?.online ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          This control toggles the modem&apos;s online state, which is equivalent to an airplane-mode style radio shutdown.
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
