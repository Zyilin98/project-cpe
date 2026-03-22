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
      setError('Please upload an OTA archive in .tar.gz, .tgz or .zip format.')
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
          setSuccess('OTA package uploaded and validated successfully.')
        } else {
          setError(`OTA validation failed: ${response.data.validation.error || 'Unknown validation error.'}`)
        }
        await loadStatus()
      } else {
        setError(response.message || 'Failed to upload the OTA package.')
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
            ? 'Update applied. The device will restart now.'
            : 'Update applied. Restart the service or device later to fully activate it.',
        )
        setUploadResult(null)
        await loadStatus()
      } else {
        setError(response.message || 'Failed to apply the update.')
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
        setSuccess('Pending OTA update removed.')
        setUploadResult(null)
        await loadStatus()
      } else {
        setError(response.message || 'Failed to cancel the pending update.')
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
        eyebrow="Release workspace"
        title="OTA Update"
        description="Upload release bundles, validate package integrity and promote a pending build to the running device when you are ready."
        chips={[
          status?.current_version ? `Current ${status.current_version}` : 'No current version',
          status?.pending_update ? 'Pending update present' : 'No pending update',
          uploadResult?.validation.valid ? 'Latest upload validated' : 'Awaiting package',
        ]}
        actions={
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => void loadStatus()}>
            Refresh status
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
              Current release
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This is the build currently running on the device.
            </Typography>
            <MetaRow label="Version" value={status?.current_version || 'N/A'} />
            <MetaRow label="Commit" value={status?.current_commit || 'N/A'} monospace />
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
              Upload package
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Accepted formats: `.tar.gz`, `.tgz`, `.zip`. The package will be validated before it can be applied.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Use a verified OTA bundle built for this device architecture. Invalid archives may upload successfully but still fail validation.
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
              {uploading ? 'Uploading...' : 'Choose OTA package'}
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
                    Pending update
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
                    Apply update
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setConfirmDialog('cancel')}>
                    Cancel update
                  </Button>
                </Box>
              </Box>

              <MetaRow label="Version" value={status.pending_meta.version} />
              <MetaRow label="Commit" value={status.pending_meta.commit} monospace />
              <MetaRow label="Build time" value={status.pending_meta.build_time} />
              <MetaRow label="Architecture" value={status.pending_meta.arch} />
            </Paper>
          )}

          {uploadResult && (
            <Paper sx={{ p: 3, borderRadius: 5 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                {uploadResult.validation.valid ? <CheckCircle color="success" /> : <ErrorIcon color="error" />}
                <Typography variant="h6" fontWeight={700}>
                  Upload validation
                </Typography>
                <Chip
                  label={uploadResult.validation.valid ? 'Passed' : 'Failed'}
                  color={uploadResult.validation.valid ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                    <MetaRow label="Version" value={uploadResult.meta.version} />
                    <MetaRow label="Commit" value={uploadResult.meta.commit} monospace />
                    <MetaRow label="Build time" value={uploadResult.meta.build_time} />
                    <MetaRow label="Architecture" value={uploadResult.meta.arch} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                    <MetaRow label="Binary MD5" value={uploadResult.meta.binary_md5} monospace />
                    <MetaRow label="Frontend MD5" value={uploadResult.meta.frontend_md5} monospace />
                  </Paper>
                </Grid>
              </Grid>

              <Box display="flex" gap={1} flexWrap="wrap">
                <ValidationChip label={uploadResult.validation.is_newer ? 'Newer build' : 'Not newer'} ok={uploadResult.validation.is_newer} />
                <ValidationChip label="Binary hash" ok={uploadResult.validation.binary_md5_match} />
                <ValidationChip label="Frontend hash" ok={uploadResult.validation.frontend_md5_match} />
                <ValidationChip label="Architecture" ok={uploadResult.validation.arch_match} />
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
                No pending OTA package
              </Typography>
              <Typography color="text.secondary">
                Upload a release bundle to validate it and prepare the next system update.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={confirmDialog === 'apply'} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>Apply OTA update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Applying the pending update replaces the current backend and frontend bundle on the device.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Restarting immediately is recommended when you want the new release to become active right away.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button onClick={() => void handleApply(false)} variant="outlined">
            Apply only
          </Button>
          <Button onClick={() => void handleApply(true)} variant="contained" color="success" startIcon={<RestartAlt />}>
            Apply and restart
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog === 'cancel'} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>Discard pending OTA update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This removes the uploaded package that is waiting to be installed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Back</Button>
          <Button onClick={() => void handleCancel()} variant="contained" color="error">
            Discard update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
