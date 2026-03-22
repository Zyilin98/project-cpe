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
import { useI18n } from '@/contexts/I18nContext'
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
  const { t } = useI18n()
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<Wifi color="primary" />}
          title={t('configuration.data.title')}
          statusLabel={dataStatus ? t('common.enabled') : t('common.disabled')}
          statusColor={dataStatus ? 'success' : 'default'}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('configuration.data.description')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={<Switch checked={dataStatus} onChange={onToggle} color="primary" />}
          label={
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {dataStatus ? t('configuration.data.enabledTitle') : t('configuration.data.disabledTitle')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dataStatus ? t('configuration.data.disableAction') : t('configuration.data.enableAction')}
              </Typography>
            </Box>
          }
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          {t('configuration.data.warning')}
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
