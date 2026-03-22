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
  rebooting: boolean
  onApply: () => void
  onReboot: () => void
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
  rebooting,
  onApply,
  onReboot,
  getModeNameByValue,
}: ConfigurationUsbSectionProps) {
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<Usb color="primary" />}
          title="USB Mode"
          statusLabel={usbMode?.current_mode_name || 'N/A'}
          statusColor="primary"
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose how the modem presents its USB networking interface to the host operating system.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">USB network mode</FormLabel>
          <RadioGroup
            value={selectedUsbMode}
            onChange={(event) => onSelectedUsbModeChange(Number(event.target.value))}
          >
            <FormControlLabel
              value={1}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">CDC-NCM (Recommended)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Best overall throughput, ideal for Linux and macOS hosts.
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={2}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">CDC-ECM</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Broad compatibility for older systems with slightly lower performance.
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value={3}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">RNDIS</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Best suited for Windows hosts that expect the RNDIS stack.
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
                    Hot switch mode
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Apply the USB mode immediately without waiting for a reboot. Use carefully while testing.
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Box>

        {!useHotSwitch && (
          <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
            <FormLabel component="legend">Persistence</FormLabel>
            <RadioGroup
              value={usbModePermanent ? 'permanent' : 'temporary'}
              onChange={(event) => onUsbModePermanentChange(event.target.value === 'permanent')}
            >
              <FormControlLabel
                value="temporary"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Temporary (Recommended)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applies on the next boot once, then clears automatically.
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="permanent"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Permanent</Typography>
                    <Typography variant="caption" color="text.secondary">
                      The selected USB mode is reused on every system boot.
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
            {hotSwitching ? 'Switching...' : useHotSwitch ? 'Apply hot switch' : 'Save configuration'}
          </Button>
          {!useHotSwitch && (
            <Button
              variant="outlined"
              color="error"
              onClick={onReboot}
              disabled={rebooting}
              startIcon={rebooting ? <CircularProgress size={20} /> : undefined}
            >
              {rebooting ? 'Rebooting...' : 'Reboot now'}
            </Button>
          )}
        </Box>

        <Alert severity={useHotSwitch ? 'warning' : 'info'} sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {useHotSwitch ? 'Hot switch notes' : 'Before you apply'}
          </Typography>
          {useHotSwitch ? (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2">
                The mode change takes effect immediately and may interrupt connectivity for a short time.
              </Typography>
              <Typography component="li" variant="body2">
                If the hot switch fails, fall back to the reboot-based flow.
              </Typography>
              <Typography component="li" variant="body2">
                Current hardware mode: {usbMode?.current_mode_name || 'N/A'}
              </Typography>
            </Box>
          ) : (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2">
                Saved USB changes only take effect after the next reboot.
              </Typography>
              <Typography component="li" variant="body2">
                Current hardware mode: {usbMode?.current_mode_name || 'N/A'}
              </Typography>
              {usbMode?.temporary_mode && (
                <Typography component="li" variant="body2">
                  Pending temporary mode: {getModeNameByValue(usbMode.temporary_mode)}
                </Typography>
              )}
              {usbMode?.permanent_mode && (
                <Typography component="li" variant="body2">
                  Saved permanent mode: {getModeNameByValue(usbMode.permanent_mode)}
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
