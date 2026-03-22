import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  Cancel,
  CheckCircle,
  CloudUpload,
  Error as ErrorIcon,
  Refresh,
  RestartAlt,
  SystemUpdateAlt,
  Warning,
} from '@mui/icons-material'
import { api } from '../api'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import { useI18n } from '../contexts/I18nContext'
import type { OtaStatusResponse, OtaUploadResponse } from '../api/types'
import { alpha } from '../utils/theme'

type ConfirmDialogState = 'apply' | 'cancel' | null

function MetaRow({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <Box display="flex" justifyContent="space-between" gap={2} py={1.25} borderBottom={1} borderColor="divider">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          fontFamily: monospace ? 'monospace' : 'inherit',
          textAlign: 'right',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

function ValidationChip({
  label,
  ok,
}: {
  label: string
  ok: boolean
}) {
  return <Chip label={label} color={ok ? 'success' : 'error'} size="small" variant={ok ? 'filled' : 'outlined'} />
}

export default function OtaUpdate() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [status, setStatus] = useState<OtaStatusResponse | null>(null)
  const [uploadResult, setUploadResult] = useState<OtaUploadResponse | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadStatus = useCallback(async () => {
    try {
      const response = await api.getOtaStatus()
      if (response.data) {
        setStatus(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validExtensions = ['.tar.gz', '.tgz', '.zip']
    const isValid = validExtensions.some((extension) => file.name.endsWith(extension))
    if (!isValid) {
      setError(t('ota.upload.invalidArchive'))
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)
    setUploadResult(null)

    try {
      const response = await api.uploadOta(file)
      if (response.status === 'ok' && response.data) {
        setUploadResult(response.data)
        if (response.data.validation.valid) {
          setSuccess(t('ota.upload.success'))
        } else {
          setError(
            t('ota.upload.validationFailed', {
              error: response.data.validation.error || t('common.unknown'),
            }),
          )
        }
        await loadStatus()
      } else {
        setError(response.message || t('ota.upload.uploadFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleApply = async (restartNow: boolean) => {
    setConfirmDialog(null)
    setApplying(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.applyOta(restartNow)
      if (response.status === 'ok') {
        setSuccess(
          restartNow
            ? t('ota.actions.applyRestartSuccess')
            : t('ota.actions.applyLaterSuccess'),
        )
        setUploadResult(null)
        await loadStatus()
      } else {
        setError(response.message || t('common.error'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setApplying(false)
    }
  }

  const handleCancel = async () => {
    setConfirmDialog(null)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.cancelOta()
      if (response.status === 'ok') {
        setSuccess(t('ota.actions.cancelSuccess'))
        setUploadResult(null)
        await loadStatus()
      } else {
        setError(response.message || t('common.error'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

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
        eyebrow={t('ota.page.eyebrow')}
        title={t('ota.page.title')}
        description={t('ota.page.description')}
        chips={[
          status?.current_version
            ? t('ota.page.currentVersion', { version: status.current_version })
            : t('ota.page.noCurrentVersion'),
          status?.pending_update ? t('ota.page.pendingPresent') : t('ota.page.noPendingUpdate'),
          uploadResult?.validation.valid ? t('ota.page.latestValidated') : t('ota.page.awaitingPackage'),
        ]}
        actions={
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => void loadStatus()}>
            {t('ota.page.refreshStatus')}
          </Button>
        }
      />

      <ErrorSnackbar error={error} onClose={() => setError(null)} />
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 5, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('ota.current.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('ota.current.subtitle')}
            </Typography>
            <MetaRow label={t('ota.fields.version')} value={status?.current_version || t('common.na')} />
            <MetaRow label={t('ota.fields.commit')} value={status?.current_commit || t('common.na')} monospace />
          </Paper>

          <Paper
            sx={(theme) => ({
              p: 3,
              borderRadius: 5,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
              backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.1 : 0.06),
            })}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('ota.upload.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('ota.upload.subtitle')}
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              {t('ota.upload.info')}
            </Alert>

            <input
              ref={fileInputRef}
              type="file"
              accept=".gz,.tgz,.zip,application/gzip,application/x-gzip,application/x-tar,application/zip"
              style={{ display: 'none' }}
              onChange={(event) => void handleFileSelect(event)}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              fullWidth
            >
              {uploading ? t('ota.upload.uploading') : t('ota.upload.choosePackage')}
            </Button>

            {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 999 }} />}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          {status?.pending_update && status.pending_meta && (
            <Paper
              sx={(theme) => ({
                p: 3,
                borderRadius: 5,
                mb: 3,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
              })}
            >
              <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} flexWrap="wrap" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Warning color="warning" />
                  <Typography variant="h6" fontWeight={700}>
                    {t('ota.pending.title')}
                  </Typography>
                  <Chip label={status.pending_meta.version} color="warning" size="small" />
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={applying ? <CircularProgress size={20} color="inherit" /> : <SystemUpdateAlt />}
                    onClick={() => setConfirmDialog('apply')}
                    disabled={applying}
                  >
                    {t('ota.pending.apply')}
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setConfirmDialog('cancel')}>
                    {t('ota.pending.cancel')}
                  </Button>
                </Box>
              </Box>

              <MetaRow label={t('ota.fields.version')} value={status.pending_meta.version} />
              <MetaRow label={t('ota.fields.commit')} value={status.pending_meta.commit} monospace />
              <MetaRow label={t('ota.fields.buildTime')} value={status.pending_meta.build_time} />
              <MetaRow label={t('ota.fields.architecture')} value={status.pending_meta.arch} />
            </Paper>
          )}

          {uploadResult && (
            <Paper sx={{ p: 3, borderRadius: 5 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                {uploadResult.validation.valid ? <CheckCircle color="success" /> : <ErrorIcon color="error" />}
                <Typography variant="h6" fontWeight={700}>
                  {t('ota.validation.title')}
                </Typography>
                <Chip
                  label={uploadResult.validation.valid ? t('ota.validation.passed') : t('ota.validation.failed')}
                  color={uploadResult.validation.valid ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                    <MetaRow label={t('ota.fields.version')} value={uploadResult.meta.version} />
                    <MetaRow label={t('ota.fields.commit')} value={uploadResult.meta.commit} monospace />
                    <MetaRow label={t('ota.fields.buildTime')} value={uploadResult.meta.build_time} />
                    <MetaRow label={t('ota.fields.architecture')} value={uploadResult.meta.arch} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                    <MetaRow label={t('ota.fields.binaryMd5')} value={uploadResult.meta.binary_md5} monospace />
                    <MetaRow label={t('ota.fields.frontendMd5')} value={uploadResult.meta.frontend_md5} monospace />
                  </Paper>
                </Grid>
              </Grid>

              <Box display="flex" gap={1} flexWrap="wrap">
                <ValidationChip
                  label={uploadResult.validation.is_newer ? t('ota.validation.newerBuild') : t('ota.validation.notNewer')}
                  ok={uploadResult.validation.is_newer}
                />
                <ValidationChip label={t('ota.validation.binaryHash')} ok={uploadResult.validation.binary_md5_match} />
                <ValidationChip label={t('ota.validation.frontendHash')} ok={uploadResult.validation.frontend_md5_match} />
                <ValidationChip label={t('ota.fields.architecture')} ok={uploadResult.validation.arch_match} />
              </Box>

              {uploadResult.validation.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadResult.validation.error}
                </Alert>
              )}
            </Paper>
          )}

          {!status?.pending_update && !uploadResult && (
            <Paper sx={{ p: 4, borderRadius: 5, textAlign: 'center' }}>
              <SystemUpdateAlt sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" gutterBottom>
                {t('ota.empty.title')}
              </Typography>
              <Typography color="text.secondary">
                {t('ota.empty.subtitle')}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={confirmDialog === 'apply'} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>{t('ota.dialogs.applyTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('ota.dialogs.applyBody')}
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('ota.dialogs.applyWarning')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>{t('ota.dialogs.cancel')}</Button>
          <Button onClick={() => void handleApply(false)} variant="outlined">
            {t('ota.dialogs.applyOnly')}
          </Button>
          <Button onClick={() => void handleApply(true)} variant="contained" color="success" startIcon={<RestartAlt />}>
            {t('ota.dialogs.applyAndRestart')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog === 'cancel'} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>{t('ota.dialogs.discardTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('ota.dialogs.discardBody')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>{t('ota.dialogs.back')}</Button>
          <Button onClick={() => void handleCancel()} variant="contained" color="error">
            {t('ota.dialogs.discardUpdate')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
