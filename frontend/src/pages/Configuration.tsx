import { Alert, Box, CircularProgress, Paper, Snackbar } from '@mui/material'
import { DEFAULT_CALL_TEMPLATE, DEFAULT_SMS_TEMPLATE } from '../api/types'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import { alpha } from '../utils/theme'
import ConfigurationAirplaneSection from './Configuration/components/ConfigurationAirplaneSection'
import ConfigurationDataSection from './Configuration/components/ConfigurationDataSection'
import ConfigurationOverviewCards from './Configuration/components/ConfigurationOverviewCards'
import ConfigurationUsbSection from './Configuration/components/ConfigurationUsbSection'
import ConfigurationWebhookSection from './Configuration/components/ConfigurationWebhookSection'
import useConfigurationPageController from './Configuration/hooks/useConfigurationPageController'

export default function ConfigurationPage() {
  const {
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    expanded,
    handleAccordionChange,
    dataStatus,
    toggleDataConnection,
    usbMode,
    selectedUsbMode,
    setSelectedUsbMode,
    usbModePermanent,
    setUsbModePermanent,
    useHotSwitch,
    setUseHotSwitch,
    rebooting,
    hotSwitching,
    handleUsbModeApply,
    rebootSystem,
    airplaneMode,
    airplaneSwitching,
    toggleAirplaneMode,
    healthStatus,
    healthLoading,
    checkHealth,
    getModeNameByValue,
    webhookConfig,
    updateWebhookConfig,
    webhookLoading,
    webhookTesting,
    newHeaderKey,
    newHeaderValue,
    setNewHeaderKey,
    setNewHeaderValue,
    handleAddHeader,
    handleRemoveHeader,
    resetWebhookTemplates,
    handleSaveWebhook,
    handleTestWebhook,
  } = useConfigurationPageController()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        '& .MuiCard-root': {
          borderRadius: 6,
        },
        '& .MuiAccordion-root': {
          borderRadius: 6,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          '&::before': {
            display: 'none',
          },
        },
      }}
    >
      <PageHero
        eyebrow="System workspace"
        title="Configuration"
        description="Adjust connectivity policy, USB behavior and webhook forwarding inside the same expressive control surface."
        chips={[
          usbMode?.current_mode_name || 'USB unknown',
          healthStatus?.status === 'ok' ? 'Backend healthy' : 'Health pending',
          webhookConfig.enabled ? 'Webhook enabled' : 'Webhook disabled',
        ]}
      />

      <ErrorSnackbar error={error} onClose={clearError} />
      {success && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={clearSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={clearSuccess}>
            {success}
          </Alert>
        </Snackbar>
      )}

      <ConfigurationOverviewCards
        healthStatus={healthStatus}
        healthLoading={healthLoading}
        onCheckHealth={() => void checkHealth()}
        usbMode={usbMode}
        getModeNameByValue={getModeNameByValue}
      />

      <Paper
        sx={(theme) => ({
          p: { xs: 1.25, sm: 1.5 },
          borderRadius: 6,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.76 : 0.88),
          '& .MuiAccordion-root + .MuiAccordion-root': {
            mt: 1.25,
          },
          '& .MuiAccordionSummary-root': {
            minHeight: 64,
          },
        })}
      >
        <ConfigurationDataSection
          expanded={expanded === 'dataConnection'}
          onChange={handleAccordionChange('dataConnection')}
          dataStatus={dataStatus}
          onToggle={() => void toggleDataConnection()}
        />

        <ConfigurationAirplaneSection
          expanded={expanded === 'airplaneMode'}
          onChange={handleAccordionChange('airplaneMode')}
          airplaneMode={airplaneMode}
          airplaneSwitching={airplaneSwitching}
          onToggle={() => void toggleAirplaneMode()}
        />

        <ConfigurationUsbSection
          expanded={expanded === 'usbConfig'}
          onChange={handleAccordionChange('usbConfig')}
          usbMode={usbMode}
          selectedUsbMode={selectedUsbMode}
          onSelectedUsbModeChange={setSelectedUsbMode}
          usbModePermanent={usbModePermanent}
          onUsbModePermanentChange={setUsbModePermanent}
          useHotSwitch={useHotSwitch}
          onUseHotSwitchChange={setUseHotSwitch}
          hotSwitching={hotSwitching}
          rebooting={rebooting}
          onApply={handleUsbModeApply}
          onReboot={() => void rebootSystem()}
          getModeNameByValue={getModeNameByValue}
        />

        <ConfigurationWebhookSection
          expanded={expanded === 'webhook'}
          onChange={handleAccordionChange('webhook')}
          webhookConfig={webhookConfig}
          onWebhookConfigChange={updateWebhookConfig}
          newHeaderKey={newHeaderKey}
          newHeaderValue={newHeaderValue}
          onNewHeaderKeyChange={setNewHeaderKey}
          onNewHeaderValueChange={setNewHeaderValue}
          onAddHeader={handleAddHeader}
          onRemoveHeader={handleRemoveHeader}
          onResetTemplates={resetWebhookTemplates}
          onSave={() => void handleSaveWebhook()}
          onTest={() => void handleTestWebhook()}
          webhookLoading={webhookLoading}
          webhookTesting={webhookTesting}
          defaultSmsTemplate={DEFAULT_SMS_TEMPLATE}
          defaultCallTemplate={DEFAULT_CALL_TEMPLATE}
        />
      </Paper>
    </Box>
  )
}
