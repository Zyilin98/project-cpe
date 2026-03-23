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
import { useI18n } from '../contexts/I18nContext'
import { alpha } from '../utils/theme'

const dialpadButtons = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

export default function PhonePage() {
  const { t, formatDate, formatTime: formatLocaleTime } = useI18n()
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
      setError(t('phone.actions.enterPhoneNumber'))
      return
    }

    setDialLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.dialCall(dialNumber)
      if (response.status === 'ok') {
        setSuccess(t('phone.actions.dialing', { number: dialNumber }))
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
        setSuccess(t('phone.actions.endedAll'))
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
        setSuccess(t('phone.actions.answered', { number: phoneNumber }))
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
        setSuccess(t('phone.actions.deletedRecord'))
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
        setSuccess(t('phone.actions.historyCleared'))
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
        setSuccess(t('phone.actions.audioSaved'))
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
        setSuccess(t('phone.actions.forwardingSaved'))
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
        setSuccess(t('phone.actions.settingUpdated'))
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
      active: t('phone.states.active'),
      dialing: t('phone.states.dialing'),
      alerting: t('phone.states.ringing'),
      incoming: t('phone.states.incoming'),
      held: t('phone.states.held'),
    }

    return labels[state] || state
  }

  const getDirectionLabel = (direction: string) => {
    const labels: Record<string, string> = {
      incoming: t('phone.directions.incoming'),
      outgoing: t('phone.directions.outgoing'),
      missed: t('phone.directions.missed'),
    }

    return labels[direction] || direction
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatCallTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      if (isToday) {
        return formatLocaleTime(date)
      }
      return formatDate(date, {
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
        eyebrow={t('phone.page.eyebrow')}
        title={t('phone.page.title')}
        description={t('phone.page.description')}
        chips={[
          calls.length > 0 ? t('phone.page.activeCalls', { count: calls.length }) : t('phone.page.noActiveCalls'),
          t('phone.page.historyEntries', { count: callHistory.length }),
          t('phone.page.experimental'),
        ]}
        actions={
          <Button
            variant="outlined"
            onClick={() => void refreshWorkspace()}
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
          >
            {refreshing ? t('phone.page.refreshing') : t('phone.page.refreshWorkspace')}
          </Button>
        }
      />

      <ErrorSnackbar error={error} onClose={() => setError(null)} />
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 14 }}>
        <Alert severity="success" onClose={() => setSuccess(null)} variant="filled">
          {success}
        </Alert>
      </Snackbar>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 4 }}>
        {t('phone.page.warning')}
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
                  {calls.length === 1 ? calls[0].phone_number : t('phone.page.activeCalls', { count: calls.length })}
                </Typography>
                {calls.length === 1 && (
                  <Typography variant="body2" sx={{ opacity: 0.88 }}>
                    {getStateLabel(calls[0].state)} · {getDirectionLabel(calls[0].direction)}
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
                  {t('phone.liveMonitor.answer')}
                </Button>
              )}
              <Button variant="contained" color="error" startIcon={<CallEnd />} onClick={() => void handleHangupAll()}>
                {calls.length > 1 ? t('phone.liveMonitor.endAllCalls') : t('phone.liveMonitor.endCall')}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper
        sx={(theme) => ({
          mb: 2.5,
          p: 1,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.78 : 0.88),
          '& .MuiTabs-indicator': {
            height: 48,
            borderRadius: 16,
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.16),
            zIndex: 0,
          },
          '& .MuiTab-root': {
            minHeight: 48,
            borderRadius: 16,
            textTransform: 'none',
            fontWeight: 600,
            position: 'relative',
            zIndex: 1,
          },
        })}
      >
        <Tabs value={tabValue} onChange={(_event, value) => setTabValue(value)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Dialpad />} label={t('phone.tabs.dialer')} iconPosition="start" />
          <Tab icon={<History />} label={t('phone.tabs.history')} iconPosition="start" />
          <Tab icon={<Settings />} label={t('phone.tabs.voiceLab')} iconPosition="start" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 5, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('phone.dialer.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('phone.dialer.subtitle')}
              </Typography>

              <TextField
                fullWidth
                value={dialNumber}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDialNumber(event.target.value)}
                placeholder={t('phone.dialer.placeholder')}
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
                sx={{ mt: 2, width: '100%', height: 54, borderRadius: 16 }}
              >
                {dialLoading ? t('phone.dialer.dialing') : t('phone.dialer.placeCall')}
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, borderRadius: 5, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('phone.liveMonitor.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {t('phone.liveMonitor.subtitle')}
              </Typography>

              {calls.length === 0 ? (
                <Alert severity="info">{t('phone.liveMonitor.noActiveCalls')}</Alert>
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
                            <Chip label={getDirectionLabel(call.direction)} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        {call.state === 'incoming' && (
                          <Button
                            variant="contained"
                            startIcon={<Call />}
                            onClick={() => void handleAnswer(call.path, call.phone_number)}
                          >
                            {t('phone.liveMonitor.answer')}
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
                {t('phone.notes.title')}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
                <Typography component="li" variant="body2">
                  {t('phone.notes.note1')}
                </Typography>
                <Typography component="li" variant="body2">
                  {t('phone.notes.note2')}
                </Typography>
                <Typography component="li" variant="body2">
                  {t('phone.notes.note3')}
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
                  {t('phone.history.totalCalls')}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {callStats?.incoming || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('phone.history.incoming')}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="info.main">
                  {callStats?.outgoing || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('phone.history.outgoing')}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {callStats?.missed || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('phone.history.missed')}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Paper sx={{ p: 2, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700}>
                  {totalDuration}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('phone.history.totalDuration')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, borderRadius: 5 }}>
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={2.5} flexWrap="wrap">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {t('phone.history.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('phone.history.subtitle')}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={historyLoading ? <CircularProgress size={16} /> : <Refresh />}
                  onClick={() => void fetchCallHistory()}
                  disabled={historyLoading}
                >
                  {t('phone.history.refresh')}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweep />}
                  onClick={() => setClearDialogOpen(true)}
                  disabled={callHistory.length === 0}
                >
                  {t('phone.history.clearHistory')}
                </Button>
              </Box>
            </Box>

            {historyLoading && callHistory.length === 0 ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : callHistory.length === 0 ? (
              <Alert severity="info">{t('phone.history.noHistory')}</Alert>
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
                            <Chip label={getDirectionLabel(record.direction)} size="small" variant="outlined" />
                            <Chip
                              label={record.answered ? t('phone.records.answered') : t('phone.records.unanswered')}
                              size="small"
                              color={record.answered ? 'success' : 'default'}
                            />
                            {record.duration > 0 && <Chip label={formatDuration(record.duration)} size="small" />}
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
                            {formatCallTime(record.start_time)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="outlined" startIcon={<PhoneIcon />} onClick={() => handleDialFromHistory(record.phone_number)}>
                          {t('phone.history.useInDialer')}
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
                {t('phone.audio.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {t('phone.audio.subtitle')}
              </Typography>

              <Box mb={3}>
                <Box display="flex" alignItems="center" mb={1}>
                  <VolumeUp sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography sx={{ minWidth: 88 }}>{t('phone.audio.speaker')}</Typography>
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
                  <Typography sx={{ minWidth: 88 }}>{t('phone.audio.microphone')}</Typography>
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
                      {t('phone.audio.muteMicrophone')}
                    </Box>
                  }
                />
              </Box>

              <Button variant="contained" fullWidth onClick={() => void saveVolume()} disabled={volumeLoading}>
                {volumeLoading ? <CircularProgress size={20} /> : t('phone.audio.save')}
              </Button>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('phone.behavior.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('phone.behavior.subtitle')}
              </Typography>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography>{t('phone.behavior.hideCallerId')}</Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={callSettings?.hide_caller_id || 'default'}
                    onChange={(event) => void handleSetCallSetting('HideCallerId', event.target.value)}
                    disabled={settingsLoading}
                  >
                    <MenuItem value="default">{t('phone.behavior.default')}</MenuItem>
                    <MenuItem value="enabled">{t('phone.behavior.enabled')}</MenuItem>
                    <MenuItem value="disabled">{t('phone.behavior.disabled')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>{t('phone.behavior.callWaiting')}</Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={callSettings?.voice_call_waiting || 'enabled'}
                    onChange={(event) => void handleSetCallSetting('VoiceCallWaiting', event.target.value)}
                    disabled={settingsLoading}
                  >
                    <MenuItem value="enabled">{t('phone.behavior.enabled')}</MenuItem>
                    <MenuItem value="disabled">{t('phone.behavior.disabled')}</MenuItem>
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
                    {t('phone.forwarding.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('phone.forwarding.subtitle')}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={forwardingLoading ? <CircularProgress size={16} /> : <Refresh />}
                  onClick={() => void fetchForwarding()}
                  disabled={forwardingLoading}
                >
                  {t('phone.forwarding.refreshRules')}
                </Button>
              </Box>

              {forwarding && (
                <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
                  <Chip icon={<PhoneForwarded />} label={`${t('phone.forwarding.always')}: ${forwarding.voice_unconditional || t('phone.forwarding.notSet')}`} size="small" variant="outlined" />
                  <Chip icon={<PhoneForwarded />} label={`${t('phone.forwarding.busy')}: ${forwarding.voice_busy || t('phone.forwarding.notSet')}`} size="small" variant="outlined" />
                  <Chip icon={<PhoneForwarded />} label={`${t('phone.forwarding.noReply')}: ${forwarding.voice_no_reply || t('phone.forwarding.notSet')}`} size="small" variant="outlined" />
                  <Chip icon={<PhoneForwarded />} label={`${t('phone.forwarding.unreachable')}: ${forwarding.voice_not_reachable || t('phone.forwarding.notSet')}`} size="small" variant="outlined" />
                </Box>
              )}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('phone.forwarding.forwardType')}</InputLabel>
                <Select value={forwardType} label={t('phone.forwarding.forwardType')} onChange={(event) => setForwardType(event.target.value)}>
                  <MenuItem value="unconditional">{t('phone.forwarding.always')}</MenuItem>
                  <MenuItem value="busy">{t('phone.forwarding.busy')}</MenuItem>
                  <MenuItem value="noreply">{t('phone.forwarding.noReply')}</MenuItem>
                  <MenuItem value="notreachable">{t('phone.forwarding.unreachable')}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={t('phone.forwarding.forwardTo')}
                value={forwardNumber}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setForwardNumber(event.target.value)}
                placeholder={t('phone.forwarding.placeholder')}
                sx={{ mb: 2 }}
              />

              {forwardType === 'noreply' && (
                <Box mb={2.5}>
                  <Typography variant="body2" gutterBottom>
                    {t('phone.forwarding.timeout', { seconds: forwardTimeout })}
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
                {forwardingLoading ? t('phone.forwarding.saving') : t('phone.forwarding.save')}
              </Button>

              <Alert severity="info" sx={{ mt: 2.5 }}>
                {t('phone.forwarding.info')}
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>{t('phone.dialogs.clearHistoryTitle')}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {t('phone.dialogs.clearHistoryBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>{t('phone.dialogs.cancel')}</Button>
          <Button onClick={() => void handleClearHistory()} color="error" variant="contained">
            {t('phone.dialogs.confirmClear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
