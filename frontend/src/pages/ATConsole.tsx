import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  Computer,
  ContentCopy,
  Delete,
  Fingerprint,
  Send,
} from '@mui/icons-material'
import { api } from '../api'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import { useI18n } from '../contexts/I18nContext'

interface CommandHistory {
  command: string
  response: string
  timestamp: Date
  success: boolean
}

const QUICK_COMMANDS = [
  { key: 'imei', cmd: 'AT+CGSN', labelKey: 'atConsole.quick.imei', descKey: 'atConsole.quick.imeiDesc' },
  { key: 'iccid', cmd: 'AT+CCID', labelKey: 'atConsole.quick.iccid', descKey: 'atConsole.quick.iccidDesc' },
  { key: 'imsi', cmd: 'AT+CIMI', labelKey: 'atConsole.quick.imsi', descKey: 'atConsole.quick.imsiDesc' },
  { key: 'signal', cmd: 'AT+CSQ', labelKey: 'atConsole.quick.signal', descKey: 'atConsole.quick.signalDesc' },
  { key: 'registration', cmd: 'AT+CREG?', labelKey: 'atConsole.quick.registration', descKey: 'atConsole.quick.registrationDesc' },
  { key: 'operator', cmd: 'AT+COPS?', labelKey: 'atConsole.quick.operator', descKey: 'atConsole.quick.operatorDesc' },
] as const

export default function ATConsolePage() {
  const { t, formatTime } = useI18n()
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<CommandHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImei, setCurrentImei] = useState('')
  const [imeiLoading, setImeiLoading] = useState(false)
  const [showImeiPanel, setShowImeiPanel] = useState(false)
  const responseEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  useEffect(() => {
    void fetchCurrentImei()
  }, [])

  const fetchCurrentImei = async () => {
    setImeiLoading(true)
    try {
      const response = await api.sendAtCommand('AT+SPIMEI?')
      const match = response.match(/["']?(\d{15})["']?/)
      if (match) {
        setCurrentImei(match[1])
      }
    } catch (err) {
      console.error('Failed to fetch IMEI:', err)
    } finally {
      setImeiLoading(false)
    }
  }

  const sendCommand = async (nextCommand?: string) => {
    const commandToSend = nextCommand || command
    if (!commandToSend.trim()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.sendAtCommand(commandToSend)
      setHistory((previous) => [
        ...previous,
        {
          command: commandToSend,
          response,
          timestamp: new Date(),
          success: !response.toLowerCase().includes('error'),
        },
      ])
      setCommand('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitImei = async () => {
    if (currentImei.trim().length !== 15) {
      setError(t('atConsole.imei.invalidLength'))
      return
    }

    if (!/^\d+$/.test(currentImei.trim())) {
      setError(t('atConsole.imei.invalidDigits'))
      return
    }

    await sendCommand(`AT+SPIMEI=0,"${currentImei.trim()}"`)
    setTimeout(() => {
      void fetchCurrentImei()
    }, 1000)
  }

  const imeiChip = currentImei.trim().length === 15 ? t('atConsole.page.imeiLoaded') : t('atConsole.page.imeiUnknown')

  return (
    <Box>
      <PageHero
        eyebrow={t('atConsole.page.eyebrow')}
        title={t('atConsole.page.title')}
        description={t('atConsole.page.description')}
        chips={[t('atConsole.page.historyCount', { count: history.length }), imeiChip]}
      />

      <ErrorSnackbar error={error} onClose={() => setError(null)} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 2,
              minHeight: 360,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 5,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Computer color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  {t('atConsole.history.title')}
                </Typography>
                {history.length > 0 && <Chip label={history.length} size="small" color="primary" variant="outlined" />}
              </Box>
              <Button
                variant="text"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={() => setHistory([])}
                disabled={history.length === 0}
              >
                {t('atConsole.history.clear')}
              </Button>
            </Box>

            {history.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
                <Typography variant="body2" color="text.secondary">
                  {t('atConsole.history.empty')}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  backgroundColor: '#111827',
                  borderRadius: 3,
                  p: 1.5,
                }}
              >
                {history.map((entry, index) => (
                  <Box key={`${entry.timestamp.toISOString()}-${index}`} mb={index < history.length - 1 ? 1.5 : 0}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
                        <Chip
                          label={formatTime(entry.timestamp)}
                          size="small"
                          sx={{
                            backgroundColor: '#1f2937',
                            color: '#9ca3af',
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                        <Chip
                          label={entry.success ? t('atConsole.states.ok') : t('atConsole.states.err')}
                          size="small"
                          color={entry.success ? 'success' : 'error'}
                          sx={{ fontFamily: 'monospace', fontSize: '0.65rem', height: 20 }}
                        />
                      </Box>
                      <Tooltip title={t('atConsole.actions.copyResponse')}>
                        <IconButton size="small" onClick={() => void navigator.clipboard.writeText(entry.response)} sx={{ color: '#9ca3af' }}>
                          <ContentCopy sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ backgroundColor: '#1f2937', borderRadius: 2, px: 1, py: 0.75, mb: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          color: '#67e8f9',
                          fontSize: '0.8rem',
                        }}
                      >
                        $ {entry.command}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: '#0b1220',
                        borderRadius: 2,
                        px: 1,
                        py: 0.75,
                        borderLeft: `3px solid ${entry.success ? '#22c55e' : '#ef4444'}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        component="pre"
                        sx={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          color: entry.success ? '#bbf7d0' : '#fecaca',
                          fontFamily: 'monospace',
                        }}
                      >
                        {entry.response}
                      </Typography>
                    </Box>

                    {index < history.length - 1 && <Divider sx={{ mt: 1.5, borderColor: '#263244' }} />}
                  </Box>
                ))}
                <div ref={responseEndRef} />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2.5, borderRadius: 5 }}>
            <Box display="flex" flexWrap="wrap" gap={0.75} mb={2}>
              {QUICK_COMMANDS.map((item) => (
                <Tooltip key={item.key} title={`${item.cmd} - ${t(item.descKey)}`}>
                  <Chip
                    label={t(item.labelKey)}
                    onClick={() => void sendCommand(item.cmd)}
                    color="primary"
                    variant="outlined"
                    clickable
                    disabled={loading}
                  />
                </Tooltip>
              ))}
              <Chip
                icon={<Fingerprint />}
                label={t('atConsole.imei.toggle')}
                onClick={() => setShowImeiPanel((current) => !current)}
                color={showImeiPanel ? 'warning' : 'default'}
                variant={showImeiPanel ? 'filled' : 'outlined'}
                clickable
              />
            </Box>

            <Collapse in={showImeiPanel}>
              <Box sx={{ mb: 2, p: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  {t('atConsole.imei.warning')}
                </Alert>
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  <TextField
                    label={t('atConsole.quick.imei')}
                    value={currentImei}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const value = event.target.value.replace(/\D/g, '').slice(0, 15)
                      setCurrentImei(value)
                    }}
                    placeholder="867164060028129"
                    disabled={imeiLoading}
                    size="small"
                    inputProps={{ maxLength: 15, pattern: '[0-9]*' }}
                    helperText={`${currentImei.length}/15`}
                    sx={{
                      flex: 1,
                      minWidth: 220,
                      '& input': {
                        fontFamily: 'monospace',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => void handleSubmitImei()}
                    disabled={loading || imeiLoading || currentImei.length !== 15}
                  >
                    {t('atConsole.imei.write')}
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => void fetchCurrentImei()} disabled={loading || imeiLoading}>
                    {t('atConsole.imei.read')}
                  </Button>
                </Box>
              </Box>
            </Collapse>

            <Box display="flex" gap={1} alignItems="flex-end">
              <TextField
                fullWidth
                value={command}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setCommand(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'Enter' && event.ctrlKey) {
                    event.preventDefault()
                    void sendCommand()
                  }
                }}
                placeholder={t('atConsole.input.placeholder')}
                disabled={loading}
                size="small"
                sx={{
                  '& input': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={() => void sendCommand()}
                disabled={loading || !command.trim()}
                sx={{ minWidth: 108, height: 40 }}
                startIcon={<Send />}
              >
                {t('atConsole.input.send')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
