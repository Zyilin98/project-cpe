import type { ChangeEvent, SyntheticEvent } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Add, ExpandMore, PlayArrow, Webhook } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import type { WebhookConfig } from '../../../api/types'
import ConfigurationSectionHeader from './ConfigurationSectionHeader'

interface ConfigurationWebhookSectionProps {
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
  webhookConfig: WebhookConfig
  onWebhookConfigChange: (patch: Partial<WebhookConfig>) => void
  newHeaderKey: string
  newHeaderValue: string
  onNewHeaderKeyChange: (value: string) => void
  onNewHeaderValueChange: (value: string) => void
  onAddHeader: () => void
  onRemoveHeader: (key: string) => void
  onResetTemplates: () => void
  onSave: () => void
  onTest: () => void
  webhookLoading: boolean
  webhookTesting: boolean
  defaultSmsTemplate: string
  defaultCallTemplate: string
}

export default function ConfigurationWebhookSection({
  expanded,
  onChange,
  webhookConfig,
  onWebhookConfigChange,
  newHeaderKey,
  newHeaderValue,
  onNewHeaderKeyChange,
  onNewHeaderValueChange,
  onAddHeader,
  onRemoveHeader,
  onResetTemplates,
  onSave,
  onTest,
  webhookLoading,
  webhookTesting,
  defaultSmsTemplate,
  defaultCallTemplate,
}: ConfigurationWebhookSectionProps) {
  const { t } = useI18n()
  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<Webhook color={webhookConfig.enabled ? 'success' : 'primary'} />}
          title={t('configuration.webhook.title')}
          statusLabel={webhookConfig.enabled ? t('common.enabled') : t('common.disabled')}
          statusColor={webhookConfig.enabled ? 'success' : 'default'}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('configuration.webhook.description')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={webhookConfig.enabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ enabled: event.target.checked })}
              color="success"
            />
          }
          label={
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {webhookConfig.enabled ? t('configuration.webhook.forwardingEnabled') : t('configuration.webhook.forwardingDisabled')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('configuration.webhook.forwardingHint')}
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label={t('configuration.webhook.url')}
          value={webhookConfig.url}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ url: event.target.value })}
          placeholder={t('configuration.webhook.urlPlaceholder')}
          sx={{ mb: 2 }}
          disabled={!webhookConfig.enabled}
        />

        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <FormControlLabel
            control={
              <Switch
                checked={webhookConfig.forward_sms}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ forward_sms: event.target.checked })}
                disabled={!webhookConfig.enabled}
              />
            }
            label={t('configuration.webhook.forwardSms')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={webhookConfig.forward_calls}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ forward_calls: event.target.checked })}
                disabled={!webhookConfig.enabled}
              />
            }
            label={t('configuration.webhook.forwardCalls')}
          />
        </Box>

        <TextField
          fullWidth
          label={t('configuration.webhook.signingSecret')}
          value={webhookConfig.secret}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ secret: event.target.value })}
          placeholder={t('configuration.webhook.signingSecretPlaceholder')}
          type="password"
          sx={{ mb: 2 }}
          disabled={!webhookConfig.enabled}
          helperText={t('configuration.webhook.signingSecretHelp')}
        />

        <Typography variant="subtitle2" gutterBottom>
          {t('configuration.webhook.customHeaders')}
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <TextField
            size="small"
            label={t('configuration.webhook.headerKey')}
            value={newHeaderKey}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onNewHeaderKeyChange(event.target.value)}
            disabled={!webhookConfig.enabled}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label={t('configuration.webhook.headerValue')}
            value={newHeaderValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onNewHeaderValueChange(event.target.value)}
            disabled={!webhookConfig.enabled}
            sx={{ flex: 1 }}
          />
          <IconButton
            color="primary"
            onClick={onAddHeader}
            disabled={!webhookConfig.enabled || !newHeaderKey.trim() || !newHeaderValue.trim()}
          >
            <Add />
          </IconButton>
        </Box>
        {Object.keys(webhookConfig.headers).length > 0 && (
          <Box mb={2}>
            {Object.entries(webhookConfig.headers).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => onRemoveHeader(key)}
                size="small"
                sx={{ mr: 1, mb: 1 }}
                disabled={!webhookConfig.enabled}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {t('configuration.webhook.payloadTemplates')}
          <Chip label={t('configuration.webhook.json')} size="small" variant="outlined" />
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {t('configuration.webhook.supportedSms')}: <code>{'{{phone_number}}'}</code>, <code>{'{{content}}'}</code>, <code>{'{{timestamp}}'}</code>, <code>{'{{direction}}'}</code>, <code>{'{{status}}'}</code>
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {t('configuration.webhook.supportedCall')}: <code>{'{{phone_number}}'}</code>, <code>{'{{duration}}'}</code>, <code>{'{{start_time}}'}</code>, <code>{'{{end_time}}'}</code>, <code>{'{{answered}}'}</code>, <code>{'{{direction}}'}</code>
          </Typography>
        </Alert>

        <TextField
          fullWidth
          label={t('configuration.webhook.smsTemplate')}
          value={webhookConfig.sms_template}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ sms_template: event.target.value })}
          multiline
          rows={6}
          sx={{ mb: 2 }}
          disabled={!webhookConfig.enabled}
          placeholder={defaultSmsTemplate}
          InputProps={{
            sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
          }}
        />

        <TextField
          fullWidth
          label={t('configuration.webhook.callTemplate')}
          value={webhookConfig.call_template}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onWebhookConfigChange({ call_template: event.target.value })}
          multiline
          rows={6}
          sx={{ mb: 2 }}
          disabled={!webhookConfig.enabled}
          placeholder={defaultCallTemplate}
          InputProps={{
            sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
          }}
        />

        <Box display="flex" gap={1} mb={2}>
          <Button size="small" variant="outlined" onClick={onResetTemplates} disabled={!webhookConfig.enabled}>
            {t('configuration.webhook.resetTemplates')}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={onSave}
            disabled={webhookLoading}
            startIcon={webhookLoading ? <CircularProgress size={20} /> : undefined}
          >
            {webhookLoading ? t('configuration.webhook.saving') : t('configuration.webhook.saveConfig')}
          </Button>
          <Button
            variant="outlined"
            onClick={onTest}
            disabled={webhookTesting || !webhookConfig.enabled || !webhookConfig.url}
            startIcon={webhookTesting ? <CircularProgress size={20} /> : <PlayArrow />}
          >
            {webhookTesting ? t('configuration.webhook.testing') : t('configuration.webhook.sendTest')}
          </Button>
        </Box>

        <Alert severity="success" sx={{ mt: 2 }}>
          {t('configuration.webhook.successAlert')}
        </Alert>
      </AccordionDetails>
    </Accordion>
  )
}
