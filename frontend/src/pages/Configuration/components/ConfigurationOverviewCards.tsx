import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  LinearProgress,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  CheckCircle,
  Error as ErrorIcon,
  HealthAndSafety,
  Usb,
} from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import type { UsbModeResponse } from '../../../api/types'

interface HealthStatus {
  status: string
  timestamp?: string
}

interface ConfigurationOverviewCardsProps {
  healthStatus: HealthStatus | null
  healthLoading: boolean
  onCheckHealth: () => void
  usbMode: UsbModeResponse | null
  getModeNameByValue: (mode: number) => string
}

export default function ConfigurationOverviewCards({
  healthStatus,
  healthLoading,
  onCheckHealth,
  usbMode,
  getModeNameByValue,
}: ConfigurationOverviewCardsProps) {
  const { formatTime, t } = useI18n()
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            avatar={<HealthAndSafety color="primary" />}
            title={t('configuration.overview.systemHealth')}
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            action={
              <Button
                size="small"
                onClick={onCheckHealth}
                disabled={healthLoading}
                startIcon={healthLoading ? <CircularProgress size={16} /> : undefined}
              >
                {t('common.refresh')}
              </Button>
            }
          />
          <CardContent>
            {healthLoading && !healthStatus ? (
              <LinearProgress />
            ) : (
              <Box display="flex" alignItems="center" gap={2}>
                {healthStatus?.status === 'ok' ? (
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
                ) : (
                  <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
                )}
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {healthStatus?.status === 'ok' ? t('configuration.overview.backendOnline') : t('configuration.overview.backendNeedsAttention')}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      {t('configuration.overview.serviceState')}
                    </Typography>
                    <Chip
                      label={healthStatus?.status === 'ok' ? t('common.running') : t('common.error')}
                      size="small"
                      color={healthStatus?.status === 'ok' ? 'success' : 'error'}
                    />
                  </Box>
                  {healthStatus?.timestamp && (
                    <Typography variant="caption" color="text.secondary">
                      {t('configuration.overview.lastChecked', { time: formatTime(healthStatus.timestamp) })}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            avatar={<Usb color="primary" />}
            title={t('configuration.overview.usbProfile')}
            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          />
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={usbMode?.current_mode_name || t('common.na')}
                color="primary"
                sx={{ fontSize: '1.1rem', height: 40, px: 2 }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('configuration.overview.modeCode', { code: usbMode?.current_mode ?? t('common.na') })}
                </Typography>
                {usbMode?.temporary_mode && (
                  <Typography variant="caption" color="warning.main" display="block">
                    {t('configuration.overview.pendingTemporary', { mode: getModeNameByValue(usbMode.temporary_mode) })}
                  </Typography>
                )}
                {usbMode?.permanent_mode && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('configuration.overview.savedPermanent', { mode: getModeNameByValue(usbMode.permanent_mode) })}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
