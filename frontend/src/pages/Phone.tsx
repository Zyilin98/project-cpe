import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  Backspace,
  Call,
  CallEnd,
  CallMade,
  CallReceived,
  Delete,
  DeleteSweep,
  Dialpad,
  History,
  Mic,
  MicOff,
  Phone as PhoneIcon,
  PhoneCallback,
  PhoneForwarded,
  PhoneMissed,
  Refresh,
  Settings,
  VolumeUp,
} from '@mui/icons-material'
import {
  api,
  type CallForwardingResponse,
  type CallInfo,
  type CallRecord,
  type CallSettingsResponse,
  type CallStats,
} from '../api'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import { alpha } from '../utils/theme'

const dialpadButtons = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

export default function PhonePage() {
  const [tabValue, setTabValue] = useState(0)
  const [calls, setCalls] = useState<CallInfo[]>([])
  const [dialNumber, setDialNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dialLoading, setDialLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [callStats, setCallStats] = useState<CallStats | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const [speakerVolume, setSpeakerVolume] = useState(50)
  const [micVolume, setMicVolume] = useState(50)
  const [muted, setMuted] = useState(false)
  const [volumeLoading, setVolumeLoading] = useState(false)

  const [forwarding, setForwarding] = useState<CallForwardingResponse | null>(null)
  const [forwardingLoading, setForwardingLoading] = useState(false)
  const [forwardType, setForwardType] = useState('unconditional')
  const [forwardNumber, setForwardNumber] = useState('')
  const [forwardTimeout, setForwardTimeout] = useState(20)

  const [callSettings, setCallSettings] = useState<CallSettingsResponse | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)

  const fetchCalls = useCallback(async () => {
    try {
      const response = await api.getCalls()
      if (response.status === 'ok' && response.data) {
        setCalls(response.data.calls)
      }
    } catch (err) {
      console.error('Failed to load active calls:', err)
    }
  }, [])

  const fetchCallHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const response = await api.getCallHistory(100, 0)
      if (response.status === 'ok' && response.data) {
        setCallHistory(response.data.records)
        setCallStats(response.data.stats)
      }
    } catch (err) {
      console.error('Failed to load call history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const fetchVolume = useCallback(async () => {
    try {
      const response = await api.getCallVolume()
      if (response.status === 'ok' && response.data) {
        setSpeakerVolume(response.data.speaker_volume)
        setMicVolume(response.data.microphone_volume)
        setMuted(response.data.muted)
      }
    } catch (err) {
      console.warn('Failed to load call volume settings:', err)
    }
  }, [])

  const fetchForwarding = useCallback(async () => {
    setForwardingLoading(true)
    try {
      const response = await api.getCallForwarding()
      if (response.status === 'ok' && response.data) {
        setForwarding(response.data)
      }
    } catch (err) {
      console.warn('Failed to load call forwarding settings:', err)
    } finally {
      setForwardingLoading(false)
    }
  }, [])

  const fetchCallSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const response = await api.getCallSettings()
      if (response.status === 'ok' && response.data) {
        setCallSettings(response.data)
      }
    } catch (err) {
      console.warn('Failed to load call settings:', err)
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const refreshWorkspace = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      fetchCalls(),
      fetchCallHistory(),
      fetchVolume(),
      fetchForwarding(),
      fetchCallSettings(),
    ])
    setRefreshing(false)
  }, [fetchCallHistory, fetchCallSettings, fetchCalls, fetchForwarding, fetchVolume])

  useEffect(() => {
    void refreshWorkspace()

    const interval = setInterval(() => {
      void fetchCalls()
    }, 3000)

    return () => clearInterval(interval)
  }, [fetchCalls, refreshWorkspace])

  const handleDialpadPress = (digit: string) => {
    setDialNumber((current) => current + digit)
  }

  const handleBackspace = () => {
    setDialNumber((current) => current.slice(0, -1))
  }

  const handleDial = async () => {
    if (!dialNumber.trim()) {
      setError('Please enter a phone number.')
      return
    }

    setDialLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.dialCall(dialNumber)
      if (response.status === 'ok') {
        setSuccess(`Dialing ${dialNumber}...`)
        setDialNumber('')
        void fetchCalls()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setDialLoading(false)
    }
  }

  const handleHangupAll = async () => {
    setError(null)
    setSuccess(null)

    try {
      const response = await api.hangupAllCalls()
      if (response.status === 'ok') {
        setSuccess('Ended all active calls.')
        void fetchCalls()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleAnswer = async (path: string, phoneNumber: string) => {
    setError(null)
    setSuccess(null)

    try {
      const response = await api.answerCall(path)
      if (response.status === 'ok') {
        setSuccess(`Answered ${phoneNumber}.`)
        void fetchCalls()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDialFromHistory = (phoneNumber: string) => {
    setDialNumber(phoneNumber)
    setTabValue(0)
  }

  const handleDeleteRecord = async (id: number) => {
    try {
      const response = await api.deleteCallRecord(id)
      if (response.status === 'ok') {
        setSuccess('Call record deleted.')
        void fetchCallHistory()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleClearHistory = async () => {
    setClearDialogOpen(false)
    try {
      const response = await api.clearCallHistory()
      if (response.status === 'ok') {
        setSuccess('Call history cleared.')
        void fetchCallHistory()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const saveVolume = async () => {
    setVolumeLoading(true)
    try {
      const response = await api.setCallVolume({
        speaker_volume: speakerVolume,
        microphone_volume: micVolume,
        muted,
      })
      if (response.status === 'ok') {
        setSuccess('Audio settings saved.')
        void fetchVolume()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setVolumeLoading(false)
    }
  }

  const applyForwarding = async () => {
    setForwardingLoading(true)
    try {
      const response = await api.setCallForwarding({
        forward_type: forwardType,
        number: forwardNumber,
        timeout: forwardType === 'noreply' ? forwardTimeout : undefined,
      })
      if (response.status === 'ok') {
        setSuccess('Call forwarding settings saved.')
        void fetchForwarding()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setForwardingLoading(false)
    }
  }

  const handleSetCallSetting = async (property: string, value: string) => {
    setSettingsLoading(true)
    try {
      const response = await api.setCallSettings({ property, value })
      if (response.status === 'ok') {
        setSuccess('Call setting updated.')
        void fetchCallSettings()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSettingsLoading(false)
    }
  }

  const getStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      active: 'Active',
      dialing: 'Dialing',
      alerting: 'Ringing',
      incoming: 'Incoming',
      held: 'On hold',
    }

    return labels[state] || state
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  const getCallIcon = (direction: string, answered: boolean) => {
    if (direction === 'missed') return <PhoneMissed color="error" />
    if (direction === 'incoming') return answered ? <CallReceived color="success" /> : <PhoneMissed color="error" />
    return <CallMade color="primary" />
  }

  const totalDuration = callStats ? formatDuration(callStats.total_duration) : '0:00'

  return (
    <Box>
      <PageHero
        eyebrow="Voice workspace"
        title="Phone"
        description="Legacy voice controls are kept here as an experimental workspace. Active-call monitoring and history remain available, but behavior can vary by firmware."
        chips={[
          calls.length > 0 ? `${calls.length} active calls` : 'No active calls',
          `${callHistory.length} history entries`,
          'Experimental voice stack',
        ]}
        actions={
          <Button
            variant="outlined"
            onClick={() => void refreshWorkspace()}
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh workspace'}
          </Button>
        }
      />

      <ErrorSnackbar error={error} onClose={() => setError(null)} />
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(null)} variant="filled">
          {success}
        </Alert>
      </Snackbar>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 4 }}>
        Voice features on this device are currently treated as best-effort. The UI exposes the controls, but the modem or firmware may not complete every action reliably.
      </Alert>

      {calls.length > 0 && (
        <Paper
          sx={(theme) => ({
            mb: 3,
            p: 2.5,
            borderRadius: 5,
            color: 'primary.contrastText',
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
          })}
        >
          <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'inherit' }}>
                <PhoneCallback />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {calls.length === 1 ? calls[0].phone_number : `${calls.length} active calls`}
                </Typography>
                {calls.length === 1 && (
                  <Typography variant="body2" sx={{ opacity: 0.88 }}>
                    {getStateLabel(calls[0].state)} · {calls[0].direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              {calls.length === 1 && calls[0].state === 'incoming' && (
                <Button
                  variant="contained"
                  color="inherit"
                  sx={{ color: 'success.main', bgcolor: 'common.white' }}
                  startIcon={<Call />}
                  onClick={() => void handleAnswer(calls[0].path, calls[0].phone_number)}
                >
                  Answer
                </Button>
              )}
              <Button variant="contained" color="error" startIcon={<CallEnd />} onClick={() => void handleHangupAll()}>
                {calls.length > 1 ? 'End all calls' : 'End call'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper
        sx={(theme) => ({
          mb: 2.5,
          p: 1,
          borderRadius: 5,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.78 : 0.88),
          '& .MuiTabs-indicator': {
            height: 32,
            borderRadius: 999,
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.16),
            zIndex: 0,
          },
          '& .MuiTab-root': {
            minHeight: 48,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 600,
            position: 'relative',
            zIndex: 1,
          },
        })}
      >
        <Tabs value={tabValue} onChange={(_event, value) => setTabValue(value)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Dialpad />} label="Dialer" iconPosition="start" />
          <Tab icon={<History />} label="History" iconPosition="start" />
          <Tab icon={<Settings />} label="Voice Lab" iconPosition="start" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Dial pad
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Use this area for quick outbound calls or to paste a number from your clipboard.
              </Typography>

              <TextField
                fullWidth
                value={dialNumber}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDialNumber(event.target.value)}
                placeholder="Enter a phone number"
                slotProps={{
                  input: {
                    endAdornment: dialNumber ? (
                      <IconButton size="small" onClick={handleBackspace}>
                        <Backspace />
                      </IconButton>
                    ) : undefined,
                    sx: { fontSize: '1.35rem', fontWeight: 600 },
                  },
                }}
                sx={{ mb: 3 }}
              />

              <Box sx={{ width: '100%' }}>
                {dialpadButtons.map((row, rowIndex) => (
                  <Box key={rowIndex} display="flex" justifyContent="center" gap={2} mb={1.5}>
                    {row.map((digit) => (
                      <Button
                        key={digit}
                        variant="outlined"
                        onClick={() => handleDialpadPress(digit)}
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          fontSize: '1.5rem',
                          fontWeight: 600,
                        }}
                      >
                        {digit}
                      </Button>
                    ))}
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={dialLoading ? <CircularProgress size={20} color="inherit" /> : <PhoneIcon />}
                onClick={() => void handleDial()}
                disabled={dialLoading || !dialNumber.trim()}
                sx={{ mt: 2, width: '100%', height: 54, borderRadius: 999 }}
              >
                {dialLoading ? 'Dialing...' : 'Place call'}
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, borderRadius: 5, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Live call monitor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Active calls refresh automatically every 3 seconds. Incoming calls can be answered here when firmware support is present.
              </Typography>

              {calls.length === 0 ? (
                <Alert severity="info">No active calls right now.</Alert>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {calls.map((call) => (
                    <Paper key={call.path} variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                      <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} flexWrap="wrap">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {call.phone_number}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap" mt={0.75}>
                            <Chip label={getStateLabel(call.state)} size="small" color="primary" />
                            <Chip label={call.direction === 'incoming' ? 'Incoming' : 'Outgoing'} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        {call.state === 'incoming' && (
                          <Button
                            variant="contained"
                            startIcon={<Call />}
                            onClick={() => void handleAnswer(call.path, call.phone_number)}
                          >
                            Answer
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Operational notes
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
                <Typography component="li" variant="body2">
                  Call controls are exposed for debugging and may behave differently across modem firmware versions.
                </Typography>
                <Typography component="li" variant="body2">
                  If dialing does not complete, use this page mainly for monitoring and diagnostics rather than mission-critical telephony.
                </Typography>
                <Typography component="li" variant="body2">
                  Call history and audio settings are still useful even when live call control is unreliable.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {callStats?.total || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total calls
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {callStats?.incoming || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Incoming
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="info.main">
                  {callStats?.outgoing || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Outgoing
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {callStats?.missed || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Missed
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700}>
                  {totalDuration}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total duration
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, borderRadius: 5 }}>
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2.5} flexWrap="wrap">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Call history
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review recent call attempts and reuse a number in the dialer.
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={historyLoading ? <CircularProgress size={16} /> : <Refresh />}
                  onClick={() => void fetchCallHistory()}
                  disabled={historyLoading}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweep />}
                  onClick={() => setClearDialogOpen(true)}
                  disabled={callHistory.length === 0}
                >
                  Clear history
                </Button>
              </Box>
            </Box>

            {historyLoading && callHistory.length === 0 ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : callHistory.length === 0 ? (
              <Alert severity="info">No call history is available yet.</Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={1.25}>
                {callHistory.map((record) => (
                  <Paper key={record.id} variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} flexWrap="wrap">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'action.hover', color: 'text.primary' }}>
                          {getCallIcon(record.direction, record.answered)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {record.phone_number}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap" mt={0.75}>
                            <Chip label={record.direction} size="small" variant="outlined" />
                            <Chip label={record.answered ? 'Answered' : 'Unanswered'} size="small" color={record.answered ? 'success' : 'default'} />
                            {record.duration > 0 && <Chip label={formatDuration(record.duration)} size="small" />}
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                            {formatTime(record.start_time)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="outlined" startIcon={<PhoneIcon />} onClick={() => handleDialFromHistory(record.phone_number)}>
                          Use in dialer
                        </Button>
                        <IconButton color="error" onClick={() => void handleDeleteRecord(record.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 5, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Audio controls
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Speaker and microphone settings are applied through the modem call stack when available.
              </Typography>

              <Box mb={3}>
                <Box display="flex" alignItems="center" mb={1}>
                  <VolumeUp sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography sx={{ minWidth: 88 }}>Speaker</Typography>
                  <Slider
                    value={speakerVolume}
                    onChange={(_event, value) => setSpeakerVolume(Array.isArray(value) ? value[0] : value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{ mx: 2 }}
                  />
                  <Typography sx={{ minWidth: 40 }}>{speakerVolume}%</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Mic sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography sx={{ minWidth: 88 }}>Microphone</Typography>
                  <Slider
                    value={micVolume}
                    onChange={(_event, value) => setMicVolume(Array.isArray(value) ? value[0] : value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{ mx: 2 }}
                  />
                  <Typography sx={{ minWidth: 40 }}>{micVolume}%</Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={muted} onChange={(event: ChangeEvent<HTMLInputElement>) => setMuted(event.target.checked)} color="error" />}
                  label={
                    <Box display="flex" alignItems="center">
                      <MicOff sx={{ mr: 1 }} />
                      Mute microphone
                    </Box>
                  }
                />
              </Box>

              <Button variant="contained" fullWidth onClick={() => void saveVolume()} disabled={volumeLoading}>
                {volumeLoading ? <CircularProgress size={20} /> : 'Save audio settings'}
              </Button>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Call behavior
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These modem-side settings can be slow to respond and may not be supported by every network profile.
              </Typography>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography>Hide caller ID</Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={callSettings?.hide_caller_id || 'default'}
                    onChange={(event) => void handleSetCallSetting('HideCallerId', event.target.value)}
                    disabled={settingsLoading}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Call waiting</Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={callSettings?.voice_call_waiting || 'enabled'}
                    onChange={(event) => void handleSetCallSetting('VoiceCallWaiting', event.target.value)}
                    disabled={settingsLoading}
                  >
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, borderRadius: 5 }}>
              <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2.5} flexWrap="wrap">
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Call forwarding
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fetch and apply forwarding rules if the carrier and modem stack expose them.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={forwardingLoading ? <CircularProgress size={16} /> : <Refresh />}
                  onClick={() => void fetchForwarding()}
                  disabled={forwardingLoading}
                >
                  Refresh rules
                </Button>
              </Box>

              {forwarding && (
                <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
                  <Chip icon={<PhoneForwarded />} label={`Always: ${forwarding.voice_unconditional || 'Not set'}`} size="small" variant="outlined" />
                  <Chip icon={<PhoneForwarded />} label={`Busy: ${forwarding.voice_busy || 'Not set'}`} size="small" variant="outlined" />
                  <Chip icon={<PhoneForwarded />} label={`No reply: ${forwarding.voice_no_reply || 'Not set'}`} size="small" variant="outlined" />
                  <Chip icon={<PhoneForwarded />} label={`Unreachable: ${forwarding.voice_not_reachable || 'Not set'}`} size="small" variant="outlined" />
                </Box>
              )}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Forwarding type</InputLabel>
                <Select value={forwardType} label="Forwarding type" onChange={(event) => setForwardType(event.target.value)}>
                  <MenuItem value="unconditional">Always</MenuItem>
                  <MenuItem value="busy">When busy</MenuItem>
                  <MenuItem value="noreply">No reply</MenuItem>
                  <MenuItem value="notreachable">Not reachable</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Forward to"
                value={forwardNumber}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setForwardNumber(event.target.value)}
                placeholder="Leave empty to disable the selected rule"
                sx={{ mb: 2 }}
              />

              {forwardType === 'noreply' && (
                <Box mb={2.5}>
                  <Typography variant="body2" gutterBottom>
                    Timeout: {forwardTimeout}s
                  </Typography>
                  <Slider
                    value={forwardTimeout}
                    onChange={(_event, value) => setForwardTimeout(Array.isArray(value) ? value[0] : value)}
                    min={5}
                    max={60}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              <Button variant="contained" fullWidth onClick={() => void applyForwarding()} disabled={forwardingLoading}>
                {forwardingLoading ? 'Saving...' : 'Save forwarding rule'}
              </Button>

              <Alert severity="info" sx={{ mt: 2.5 }}>
                Forwarding, caller-ID and waiting-state endpoints are kept for diagnostics. On some firmware builds these actions may report success without changing modem behavior.
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear call history?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This removes all stored call history entries from the current device view and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => void handleClearHistory()} color="error" variant="contained">
            Clear history
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
