import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  PhoneAndroid,
  SimCard,
  SwapHoriz,
  Tag,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { api } from '../api'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import type { DeviceInfo, ImeisvResponse, SimInfo, SimSlotResponse } from '../api/types'

function InfoRow({
  label,
  value,
  masked = false,
  monospace = false,
}: {
  label: string
  value: string
  masked?: boolean
  monospace?: boolean
}) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2} py={1.25} borderBottom={1} borderColor="divider">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          textAlign: 'right',
          fontFamily: monospace ? 'monospace' : 'inherit',
          filter: masked ? 'blur(5px)' : 'none',
          transition: 'filter 0.3s ease',
          userSelect: masked ? 'none' : 'auto',
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export default function DeviceInfoPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeviceId, setShowDeviceId] = useState(false)
  const [showSimInfo, setShowSimInfo] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [simInfo, setSimInfo] = useState<SimInfo | null>(null)
  const [imeisv, setImeisv] = useState<ImeisvResponse | null>(null)
  const [simSlot, setSimSlot] = useState<SimSlotResponse | null>(null)
  const [switchingSlot, setSwitchingSlot] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [deviceRes, simRes] = await Promise.all([api.getDeviceInfo(), api.getSimInfo()])

      if (deviceRes.data) setDeviceInfo(deviceRes.data)
      if (simRes.data) setSimInfo(simRes.data)

      try {
        const [imeisvRes, simSlotRes] = await Promise.all([api.getImeisv(), api.getSimSlot()])
        if (imeisvRes.data) setImeisv(imeisvRes.data)
        if (simSlotRes.data) setSimSlot(simSlotRes.data)
      } catch (extErr) {
        console.warn('Failed to load extended device info:', extErr)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const switchSimSlot = async () => {
    if (!simSlot) return
    const targetSlot = simSlot.active_slot === 1 ? 2 : 1
    setSwitchingSlot(true)
    try {
      const response = await api.switchSimSlot(targetSlot)
      if (response.status === 'ok') {
        setSuccess(`Switching to SIM slot ${targetSlot}...`)
        setTimeout(() => {
          void loadData()
        }, 2000)
      } else {
        setError(response.message || 'Failed to switch SIM slot.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSwitchingSlot(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <PageHero
        eyebrow="Hardware workspace"
        title="Device Info"
        description="Review modem identity, SIM state and slot selection from a compact hardware overview surface."
        chips={[
          deviceInfo?.online ? 'Radio online' : 'Radio offline',
          simInfo?.present ? 'SIM detected' : 'No SIM detected',
          simSlot?.active_slot ? `Slot ${simSlot.active_slot}` : 'Slot unknown',
        ]}
        actions={
          <Button variant="outlined" onClick={() => void loadData()}>
            Refresh
          </Button>
        }
      />

      <ErrorSnackbar error={error} onClose={() => setError(null)} />
      {success && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneAndroid color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Device status
                </Typography>
              </Box>
            </Box>

            <InfoRow label="Online state" value={deviceInfo?.online ? 'Online' : 'Offline'} />
            <InfoRow label="Manufacturer" value={deviceInfo?.manufacturer || 'N/A'} />
            <InfoRow label="Model" value={deviceInfo?.model || 'N/A'} />
            <InfoRow label="Firmware revision" value={deviceInfo?.revision || 'N/A'} />
            <InfoRow label="Power state" value={deviceInfo?.powered ? 'Powered on' : 'Powered off'} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Tag color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Device identity
                </Typography>
              </Box>
              <Tooltip title={showDeviceId ? 'Hide sensitive identifiers' : 'Reveal sensitive identifiers'}>
                <IconButton size="small" color="primary" onClick={() => setShowDeviceId((current) => !current)}>
                  {showDeviceId ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </Box>

            <InfoRow label="IMEI" value={deviceInfo?.imei || 'N/A'} masked={!showDeviceId} monospace />
            <InfoRow label="IMEISV" value={imeisv?.software_version_number || 'N/A'} monospace />
            <InfoRow label="ICCID" value={simInfo?.iccid || 'N/A'} masked={!showDeviceId} monospace />
            <InfoRow label="IMSI" value={simInfo?.imsi || 'N/A'} masked={!showDeviceId} monospace />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <SimCard color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  SIM profile
                </Typography>
              </Box>
              <Tooltip title={showSimInfo ? 'Hide sensitive SIM data' : 'Reveal sensitive SIM data'}>
                <IconButton size="small" color="primary" onClick={() => setShowSimInfo((current) => !current)}>
                  {showSimInfo ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </Box>

            <InfoRow label="SIM state" value={simInfo?.present ? 'Inserted' : 'Not detected'} />
            <InfoRow label="PIN state" value={simInfo?.pin_required || 'N/A'} />
            <InfoRow label="Phone numbers" value={simInfo?.phone_numbers?.join(', ') || 'N/A'} masked={!showSimInfo} monospace />
            <InfoRow label="MCC / MNC" value={`${simInfo?.mcc || 'N/A'} / ${simInfo?.mnc || 'N/A'}`} monospace />
            <InfoRow label="SMS center" value={simInfo?.sms_center || 'N/A'} masked={!showSimInfo} monospace />

            <Box pt={1.5}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Preferred languages
              </Typography>
              <Box display="flex" gap={0.75} flexWrap="wrap">
                {simInfo?.preferred_languages?.length ? (
                  simInfo.preferred_languages.map((language) => (
                    <Chip key={language} label={language.toUpperCase()} size="small" />
                  ))
                ) : (
                  <Chip label="N/A" size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <SwapHoriz color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  SIM slot
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={switchingSlot ? <CircularProgress size={18} /> : <SwapHoriz />}
                onClick={() => void switchSimSlot()}
                disabled={switchingSlot || !simSlot}
              >
                {switchingSlot ? 'Switching...' : `Switch to slot ${simSlot?.active_slot === 1 ? 2 : 1}`}
              </Button>
            </Box>

            <InfoRow label="Active slot" value={simSlot?.active_slot ? `Slot ${simSlot.active_slot}` : 'Unknown'} />
            <InfoRow label="Raw modem value" value={simSlot?.raw_value || 'N/A'} monospace />

            <Alert severity="info" sx={{ mt: 2 }}>
              After switching the SIM slot, the modem may need a short time to re-register on the mobile network.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
