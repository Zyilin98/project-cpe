import type { ChangeEvent, SyntheticEvent } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material'
import { ExpandMore, FlashOn, Usb } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import type { UsbModeResponse } from '../../../api/types'
import ConfigurationSectionHeader from './ConfigurationSectionHeader'

interface ConfigurationUsbSectionProps {
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
  usbMode: UsbModeResponse | null
  selectedUsbMode: number
  onSelectedUsbModeChange: (mode: number) => void
  usbModePermanent: boolean
  onUsbModePermanentChange: (value: boolean) => void
  useHotSwitch: boolean
  onUseHotSwitchChange: (value: boolean) => void
  hotSwitching: boolean
  onApply: () => void
  getModeNameByValue: (mode: number) => string
}

export default function ConfigurationUsbSection({
  expanded,
  onChange,
  usbMode,
  selectedUsbMode,
  onSelectedUsbModeChange,
  usbModePermanent,
  onUsbModePermanentChange,
  useHotSwitch,
  onUseHotSwitchChange,
  hotSwitching,
  onApply,
  getModeNameByValue,
}: ConfigurationUsbSectionProps) {
  const { t } = useI18n()
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<Usb color="primary" />}
          title={t('configuration.usb.title')}
          statusLabel={usbMode?.current_mode_name || t('common.na')}
          statusColor="primary"
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('configuration.usb.description')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">{t('configuration.usb.networkMode')}</FormLabel>
          <RadioGroup
            value={selectedUsbMode}
            onChange={(event) => onSelectedUsbModeChange(Number(event.target.value))}
          >
            <FormControlLabel
              value={1}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">{t('configuration.usb.cdcNcm')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('configuration.usb.cdcNcmDesc')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={2}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">{t('configuration.usb.cdcEcm')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('configuration.usb.cdcEcmDesc')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={3}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">{t('configuration.usb.rndis')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('configuration.usb.rndisDesc')}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: useHotSwitch ? 'warning.light' : 'action.hover',
            borderRadius: 1.5,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={useHotSwitch}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onUseHotSwitchChange(event.target.checked)}
                color="warning"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <FlashOn color={useHotSwitch ? 'warning' : 'disabled'} />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {t('configuration.usb.hotSwitchTitle')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('configuration.usb.hotSwitchDesc')}
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Box>

        {!useHotSwitch && (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
            <FormLabel component="legend">{t('configuration.usb.persistence')}</FormLabel>
            <RadioGroup
              value={usbModePermanent ? 'permanent' : 'temporary'}
              onChange={(event) => onUsbModePermanentChange(event.target.value === 'permanent')}
            >
              <FormControlLabel
                value="temporary"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">{t('configuration.usb.temporary')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('configuration.usb.temporaryDesc')}
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="permanent"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">{t('configuration.usb.permanent')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('configuration.usb.permanentDesc')}
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        )}

        <Box mt={2} display="flex" gap={2}>
          <Button
            variant="contained"
            fullWidth
            color={useHotSwitch ? 'warning' : 'primary'}
            onClick={onApply}
            disabled={hotSwitching || (selectedUsbMode === usbMode?.current_mode && !useHotSwitch)}
            startIcon={hotSwitching ? <CircularProgress size={20} /> : useHotSwitch ? <FlashOn /> : undefined}
          >
            {hotSwitching ? t('configuration.usb.switching') : useHotSwitch ? t('configuration.usb.applyHotSwitch') : t('configuration.usb.saveConfig')}
          </Button>
        </Box>

        <Alert severity={useHotSwitch ? 'warning' : 'info'} sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {useHotSwitch ? t('configuration.usb.hotSwitchNotes') : t('configuration.usb.beforeApply')}
          </Typography>
          {useHotSwitch ? (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2">
                {t('configuration.usb.note1')}
              </Typography>
              <Typography component="li" variant="body2">
                {t('configuration.usb.note2')}
              </Typography>
              <Typography component="li" variant="body2">
                {t('configuration.usb.currentHardwareMode', { mode: usbMode?.current_mode_name || t('common.na') })}
              </Typography>
            </Box>
          ) : (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2">
                {t('configuration.usb.savedUsbChanges')}
              </Typography>
              <Typography component="li" variant="body2">
                {t('configuration.usb.currentHardwareMode', { mode: usbMode?.current_mode_name || t('common.na') })}
              </Typography>
              {usbMode?.temporary_mode && (
                <Typography component="li" variant="body2">
                  {t('configuration.overview.pendingTemporary', { mode: getModeNameByValue(usbMode.temporary_mode) })}
                </Typography>
              )}
              {usbMode?.permanent_mode && (
                <Typography component="li" variant="body2">
                  {t('configuration.overview.savedPermanent', { mode: getModeNameByValue(usbMode.permanent_mode) })}
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
