import type { SyntheticEvent } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  ExpandMore,
  RestartAlt,
  Schedule,
  Adb,
  ContentCopy,
} from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import ConfigurationSectionHeader from './ConfigurationSectionHeader'
import type { ScheduledRebootConfig, AdbTcpStatus } from '@/api/types'

interface ConfigurationSystemSectionProps {
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
  // 手动重启
  rebooting: boolean
  onReboot: () => void
  // 定时重启
  scheduledReboot: ScheduledRebootConfig
  onScheduledRebootChange: (config: Partial<ScheduledRebootConfig>) => void
  onSaveScheduledReboot: () => void
  scheduledRebootSaving: boolean
  // ADB TCP
  adbTcpStatus: AdbTcpStatus | null
}

export default function ConfigurationSystemSection({
  expanded,
  onChange,
  rebooting,
  onReboot,
  scheduledReboot,
  onScheduledRebootChange,
  onSaveScheduledReboot,
  scheduledRebootSaving,
  adbTcpStatus,
}: ConfigurationSystemSectionProps) {
  const { t } = useI18n()

  const statusLabel = scheduledReboot.enabled
    ? t('configuration.system.scheduledEnabled')
    : t('configuration.system.scheduledDisabled')

  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<RestartAlt color="primary" />}
          title={t('configuration.system.title')}
          statusLabel={statusLabel}
          statusColor={scheduledReboot.enabled ? 'success' : 'default'}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('configuration.system.description')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ===== 手动重启 ===== */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <RestartAlt sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            {t('configuration.system.manualReboot')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t('configuration.system.manualRebootDesc')}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAlt />}
            onClick={onReboot}
            disabled={rebooting}
          >
            {rebooting ? t('configuration.usb.rebooting') : t('configuration.usb.rebootNow')}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ===== 定时重启 ===== */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <Schedule sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            {t('configuration.system.scheduledReboot')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={scheduledReboot.enabled}
                onChange={(e) => onScheduledRebootChange({ enabled: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {scheduledReboot.enabled
                    ? t('configuration.system.scheduledEnabled')
                    : t('configuration.system.scheduledDisabled')}
                </Typography>
                {scheduledReboot.next_reboot && (
                  <Typography variant="caption" color="text.secondary">
                    {scheduledReboot.next_reboot}
                  </Typography>
                )}
              </Box>
            }
          />

          {scheduledReboot.enabled && (
            <Box sx={{ mt: 2, pl: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>{t('configuration.system.rebootMode')}</InputLabel>
                <Select
                  value={scheduledReboot.mode}
                  label={t('configuration.system.rebootMode')}
                  onChange={(e) => onScheduledRebootChange({ mode: e.target.value })}
                >
                  <MenuItem value="daily">{t('configuration.system.modeDaily')}</MenuItem>
                  <MenuItem value="interval">{t('configuration.system.modeInterval')}</MenuItem>
                </Select>
              </FormControl>

              {scheduledReboot.mode === 'daily' && (
                <TextField
                  label={t('configuration.system.dailyTime')}
                  type="time"
                  size="small"
                  value={scheduledReboot.daily_time}
                  onChange={(e) => onScheduledRebootChange({ daily_time: e.target.value })}
                  sx={{ width: 160 }}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              )}

              {scheduledReboot.mode === 'interval' && (
                <TextField
                  label={t('configuration.system.intervalHours')}
                  type="number"
                  size="small"
                  value={scheduledReboot.interval_hours ?? ''}
                  onChange={(e) =>
                    onScheduledRebootChange({
                      interval_hours: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  sx={{ width: 160 }}
                  slotProps={{
                    htmlInput: { min: 1, max: 720 },
                  }}
                />
              )}

              <Button
                variant="contained"
                size="small"
                onClick={onSaveScheduledReboot}
                disabled={scheduledRebootSaving}
                sx={{ width: 'fit-content' }}
              >
                {scheduledRebootSaving
                  ? t('configuration.webhook.saving')
                  : t('common.save')}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ===== ADB TCP ===== */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <Adb sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            {t('configuration.system.adbTcp')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t('configuration.system.adbTcpDesc')}
          </Typography>

          {adbTcpStatus && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {t('configuration.system.adbPort')}:
                </Typography>
                <Chip
                  label={`${adbTcpStatus.port}`}
                  size="small"
                  color={adbTcpStatus.listening ? 'success' : 'default'}
                />
                <Chip
                  label={adbTcpStatus.listening
                    ? t('configuration.system.adbListening')
                    : t('configuration.system.adbNotListening')}
                  size="small"
                  color={adbTcpStatus.listening ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>

              {adbTcpStatus.listening && (
                <Alert
                  severity="info"
                  sx={{ mt: 1 }}
                  action={
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => {
                        void navigator.clipboard.writeText(adbTcpStatus.connect_hint)
                      }}
                    >
                      {t('common.copyJson')}
                    </Button>
                  }
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {adbTcpStatus.connect_hint}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
