import type { SyntheticEvent } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import { ExpandMore, Wifi } from '@mui/icons-material'
import ConfigurationSectionHeader from './ConfigurationSectionHeader'

interface ConfigurationDataSectionProps {
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
  dataStatus: boolean
  onToggle: () => void
}

export default function ConfigurationDataSection({
  expanded,
  onChange,
  dataStatus,
  onToggle,
}: ConfigurationDataSectionProps) {
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<Wifi color="primary" />}
          title="Data Connection"
          statusLabel={dataStatus ? 'Enabled' : 'Disabled'}
          statusColor={dataStatus ? 'success' : 'default'}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          Control whether the modem is allowed to establish a mobile data session.
          Disabling this interrupts services that depend on the carrier network.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={<Switch checked={dataStatus} onChange={onToggle} color="primary" />}
          label={
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {dataStatus ? 'Mobile data is enabled' : 'Mobile data is disabled'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dataStatus ? 'Turn off the mobile data session immediately' : 'Turn on the mobile data session immediately'}
              </Typography>
            </Box>
          }
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          Turning data off interrupts any feature that currently relies on the modem&apos;s cellular connection.
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
