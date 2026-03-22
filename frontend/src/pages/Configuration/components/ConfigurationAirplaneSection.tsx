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
import { useI18n } from '@/contexts/I18nContext'
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
  const { t } = useI18n()
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<FlightTakeoff color={airplaneMode?.enabled ? 'warning' : 'primary'} />}
          title={t('configuration.airplane.title')}
          statusLabel={airplaneMode?.enabled ? t('common.on') : t('common.off')}
          statusColor={airplaneMode?.enabled ? 'warning' : 'default'}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('configuration.airplane.description')}
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
                  {airplaneMode?.enabled ? t('configuration.airplane.enabledTitle') : t('configuration.airplane.disabledTitle')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {airplaneMode?.enabled ? t('configuration.airplane.radioOffline') : t('configuration.airplane.radioActive')}
                </Typography>
              </Box>
            </Box>
          }
        />

        <Box mt={2} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('configuration.airplane.currentState')}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={t('configuration.airplane.power', { value: airplaneMode?.powered ? t('common.on') : t('common.off') })}
              size="small"
              color={airplaneMode?.powered ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              label={t('configuration.airplane.radio', { value: airplaneMode?.online ? t('common.online') : t('common.offline') })}
              size="small"
              color={airplaneMode?.online ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('configuration.airplane.warning')}
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
