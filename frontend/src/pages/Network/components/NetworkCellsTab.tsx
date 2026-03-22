import type { Dispatch, SetStateAction } from 'react'
import type { Theme } from '@mui/material/styles'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  CellTower,
  ContentCopy,
  ExpandMore,
  Lock,
  LockOpen,
  MyLocation,
  Refresh,
  Tune,
} from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import type { CellLocationResponse, CellLockStatusResponse, CellsResponse } from '../../../api/types'
import type { RadioMode } from '../../../api'

interface NetworkCellsTabProps {
  cellsInfo: CellsResponse | null
  cellLockStatus: CellLockStatusResponse | null
  lockingCell: string | null
  unlocking: boolean
  onUnlockAllCells: () => void
  onLockCell: (tech: string, arfcn: string, pci: string) => void
  currentRadioMode: RadioMode
  modeLoading: boolean
  onRadioModeChange: (mode: RadioMode) => void
  bandConfigRefreshing: boolean
  onRefreshBandConfig: () => void
  lockMode: 'unlocked' | 'custom'
  onLockModeChange: (value: 'unlocked' | 'custom') => void
  bandLoading: boolean
  lteFddBands: number[]
  setLteFddBands: Dispatch<SetStateAction<number[]>>
  lteTddBands: number[]
  setLteTddBands: Dispatch<SetStateAction<number[]>>
  nrFddBands: number[]
  setNrFddBands: Dispatch<SetStateAction<number[]>>
  nrTddBands: number[]
  setNrTddBands: Dispatch<SetStateAction<number[]>>
  lteFddBandOptions: number[]
  lteTddBandOptions: number[]
  nrFddBandOptions: number[]
  nrTddBandOptions: number[]
  toggleBand: (band: number, setter: Dispatch<SetStateAction<number[]>>) => void
  onApplyBandLock: () => void
  onUnlockAllBands: () => void
  locationCells: NonNullable<CellLocationResponse['neighbor_cells']>
  onCopyCellLocation: () => void
  formatSignalValue: (value: string | number | undefined) => string
  getSignalChipColor: (rsrp?: string | number, rssi?: string | number) => 'success' | 'primary' | 'warning' | 'error'
}

export default function NetworkCellsTab({
  cellsInfo,
  cellLockStatus,
  lockingCell,
  unlocking,
  onUnlockAllCells,
  onLockCell,
  currentRadioMode,
  modeLoading,
  onRadioModeChange,
  bandConfigRefreshing,
  onRefreshBandConfig,
  lockMode,
  onLockModeChange,
  bandLoading,
  lteFddBands,
  setLteFddBands,
  lteTddBands,
  setLteTddBands,
  nrFddBands,
  setNrFddBands,
  nrTddBands,
  setNrTddBands,
  lteFddBandOptions,
  lteTddBandOptions,
  nrFddBandOptions,
  nrTddBandOptions,
  toggleBand,
  onApplyBandLock,
  onUnlockAllBands,
  locationCells,
  onCopyCellLocation,
  formatSignalValue,
  getSignalChipColor,
}: NetworkCellsTabProps) {
  const { t } = useI18n()
  return (
    <>
      {cellLockStatus?.any_locked && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          icon={<Lock fontSize="small" />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={unlocking ? <CircularProgress size={14} /> : <LockOpen />}
              onClick={onUnlockAllCells}
              disabled={unlocking}
            >
              {t('network.cells.unlock')}
            </Button>
          }
        >
          {cellLockStatus.rat_status.filter((status) => status.enabled).map((status, index) => (
            <Typography key={index} variant="caption">
              {status.rat_name}: ARFCN={status.arfcn}, PCI={status.pci}
            </Typography>
          ))}
        </Alert>
      )}

      <Card>
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <CellTower fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="medium">{t('network.cells.listTitle')}</Typography>
            {cellsInfo?.cells && <Chip label={`${cellsInfo.cells.length}`} size="small" color="primary" variant="outlined" />}
          </Box>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={unlocking ? <CircularProgress size={14} /> : <LockOpen />}
            onClick={onUnlockAllCells}
            disabled={unlocking}
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            {unlocking ? t('network.cells.unlocking') : t('network.cells.clearLocks')}
          </Button>
        </Box>

        <CardContent sx={{ pt: 0, px: { xs: 1, sm: 2 } }}>
          {cellsInfo?.serving_cell && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Chip label={cellsInfo.serving_cell.tech?.toUpperCase() || '-'} size="small" color="primary" />
              <Typography variant="caption" color="text.secondary">CID: <strong>{cellsInfo.serving_cell.cell_id}</strong></Typography>
              <Typography variant="caption" color="text.secondary">TAC: <strong>{cellsInfo.serving_cell.tac}</strong></Typography>
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: { xs: 350, sm: 400 } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 0.5, px: 1, fontSize: '0.7rem', minWidth: 55 }}>{t('dashboard.cells.band')}</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', minWidth: 55 }}>{t('dashboard.cells.arfcn')}</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', minWidth: 40 }}>{t('dashboard.cells.pci')}</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', minWidth: 50 }}>{t('dashboard.cells.rsrp')}</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', minWidth: 45, display: { xs: 'none', sm: 'table-cell' } }}>{t('dashboard.cells.rsrq')}</TableCell>
                  <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', minWidth: 45, display: { xs: 'none', sm: 'table-cell' } }}>{t('dashboard.cells.sinr')}</TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', minWidth: 60 }}>{t('network.cells.lock')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cellsInfo?.cells && cellsInfo.cells.length > 0 ? (
                  cellsInfo.cells.map((cell, index) => {
                    const cellArfcn = Number(cell.arfcn || cell.earfcn || cell.nrarfcn || 0)
                    const cellPci = Number(cell.pci || 0)
                    const cellTech = cell.tech || (cell.type === 'NR' ? 'nr' : 'lte')
                    const isLocked = cellLockStatus?.rat_status.some(
                      (status) =>
                        status.enabled &&
                        status.arfcn === cellArfcn &&
                        status.pci === cellPci &&
                        ((cellTech.toLowerCase() === 'nr' && status.rat === 16) ||
                          (cellTech.toLowerCase() !== 'nr' && status.rat === 12)),
                    )

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          bgcolor: isLocked
                            ? (theme: Theme) => (theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.15)' : 'warning.light')
                            : cell.is_serving
                              ? (theme: Theme) => (theme.palette.mode === 'dark' ? 'rgba(102, 187, 106, 0.15)' : 'rgba(102, 187, 106, 0.08)')
                              : 'inherit',
                        }}
                      >
                        <TableCell sx={{ py: 0.5, px: 1 }}>{cell.band && cell.band !== '0' ? cell.band || '-' : '-'}</TableCell>
                        <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.75rem', fontFamily: 'monospace' }}>{cell.arfcn || cell.earfcn || cell.nrarfcn || '-'}</TableCell>
                        <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.75rem', fontFamily: 'monospace' }}>{cell.pci || '-'}</TableCell>
                        <TableCell align="right" sx={{ py: 0.5, px: 0.5 }}>
                          {cell.rsrp !== undefined ? (
                            <Chip label={formatSignalValue(cell.rsrp)} size="small" color={getSignalChipColor(cell.rsrp)} sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }} />
                          ) : cell.ssb_rsrp !== undefined ? (
                            <Chip label={formatSignalValue(cell.ssb_rsrp)} size="small" color={getSignalChipColor(cell.ssb_rsrp)} sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }} />
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', fontFamily: 'monospace', display: { xs: 'none', sm: 'table-cell' } }}>
                          {cell.rsrq !== undefined ? formatSignalValue(cell.rsrq) : cell.ssb_rsrq !== undefined ? formatSignalValue(cell.ssb_rsrq) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.5, px: 0.5, fontSize: '0.7rem', fontFamily: 'monospace', display: { xs: 'none', sm: 'table-cell' } }}>
                          {cell.sinr !== undefined ? formatSignalValue(cell.sinr) : cell.ssb_sinr !== undefined ? formatSignalValue(cell.ssb_sinr) : '-'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5, px: 0.5 }}>
                          {(() => {
                            const arfcn = String(cell.arfcn || cell.earfcn || cell.nrarfcn || '')
                            const pci = String(cell.pci || '')
                            const tech = cell.tech || (cell.type === 'NR' ? 'nr' : 'lte')
                            const cellKey = `${tech}-${arfcn}-${pci}`
                            const isLocking = lockingCell === cellKey
                            if (!arfcn || !pci) return '-'
                            return (
                              <Button
                                size="small"
                                variant={isLocked ? 'contained' : 'text'}
                                color={isLocked ? 'warning' : 'primary'}
                                onClick={() => (isLocked ? onUnlockAllCells() : onLockCell(tech, arfcn, pci))}
                                disabled={isLocking || !!lockingCell || unlocking}
                                sx={{ minWidth: 40, p: 0.5, fontSize: '0.7rem' }}
                              >
                                {isLocking ? t('network.cells.locking') : isLocked ? t('network.cells.unlock') : t('network.cells.lock')}
                              </Button>
                            )
                          })()}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                      <Typography variant="caption" color="text.secondary">{t('network.cells.noCellData')}</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Tune fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="medium">{t('network.cells.bandLockTitle')}</Typography>
          </Box>
          <Button size="small" variant="text" startIcon={bandConfigRefreshing ? <CircularProgress size={14} /> : <Refresh />} onClick={onRefreshBandConfig} disabled={bandConfigRefreshing} sx={{ minWidth: 'auto', fontSize: '0.75rem' }}>
            {t('network.cells.refresh')}
          </Button>
        </Box>
        <CardContent sx={{ pt: 0, px: { xs: 1.5, sm: 2 } }}>
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">{t('network.cells.radioMode')}</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip label={t('network.cells.auto')} size="small" color={currentRadioMode === 'auto' ? 'primary' : 'default'} onClick={() => onRadioModeChange('auto')} disabled={modeLoading} />
              <Chip label="LTE" size="small" color={currentRadioMode === 'lte' ? 'primary' : 'default'} onClick={() => onRadioModeChange('lte')} disabled={modeLoading} />
              <Chip label="NR" size="small" color={currentRadioMode === 'nr' ? 'primary' : 'default'} onClick={() => onRadioModeChange('nr')} disabled={modeLoading} />
              {modeLoading && <CircularProgress size={16} />}
            </Stack>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">{t('network.cells.lockMode')}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={t('network.cells.unlockedAll')} size="small" color={lockMode === 'unlocked' ? 'success' : 'default'} onClick={() => onLockModeChange('unlocked')} disabled={bandLoading} icon={lockMode === 'unlocked' ? <LockOpen /> : undefined} />
              <Chip label={t('network.cells.customAllowList')} size="small" color={lockMode === 'custom' ? 'warning' : 'default'} onClick={() => onLockModeChange('custom')} disabled={bandLoading} icon={lockMode === 'custom' ? <Lock /> : undefined} />
            </Stack>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {lockMode === 'custom' && (
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">LTE FDD</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {lteFddBandOptions.map((band) => (
                    <FormControlLabel key={`lte-fdd-${band}`} control={<Checkbox checked={lteFddBands.includes(band)} onChange={() => toggleBand(band, setLteFddBands)} size="small" sx={{ p: 0.25 }} />} label={<Typography variant="caption">B{band}</Typography>} sx={{ mr: 0.5, ml: 0 }} />
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">LTE TDD</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {lteTddBandOptions.map((band) => (
                    <FormControlLabel key={`lte-tdd-${band}`} control={<Checkbox checked={lteTddBands.includes(band)} onChange={() => toggleBand(band, setLteTddBands)} size="small" sx={{ p: 0.25 }} />} label={<Typography variant="caption">B{band}</Typography>} sx={{ mr: 0.5, ml: 0 }} />
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">NR FDD</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {nrFddBandOptions.map((band) => (
                    <FormControlLabel key={`nr-fdd-${band}`} control={<Checkbox checked={nrFddBands.includes(band)} onChange={() => toggleBand(band, setNrFddBands)} size="small" sx={{ p: 0.25 }} />} label={<Typography variant="caption">n{band}</Typography>} sx={{ mr: 0.5, ml: 0 }} />
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">NR TDD</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {nrTddBandOptions.map((band) => (
                    <FormControlLabel key={`nr-tdd-${band}`} control={<Checkbox checked={nrTddBands.includes(band)} onChange={() => toggleBand(band, setNrTddBands)} size="small" sx={{ p: 0.25 }} />} label={<Typography variant="caption">n{band}</Typography>} sx={{ mr: 0.5, ml: 0 }} />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}

          {lockMode === 'unlocked' && <Alert severity="success" sx={{ mb: 2 }}>{t('network.cells.unlockedHelp')}</Alert>}
          {lockMode === 'custom' && <Alert severity="info" sx={{ mt: 1.5, mb: 1.5 }}>{t('network.cells.customHelp')}</Alert>}

          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" size="small" onClick={onApplyBandLock} disabled={bandLoading} startIcon={bandLoading ? <CircularProgress size={14} /> : <Lock />}>{t('network.cells.apply')}</Button>
            <Button variant="outlined" color="success" size="small" onClick={onUnlockAllBands} disabled={bandLoading} startIcon={<LockOpen />}>{t('network.cells.clearRestrictions')}</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <MyLocation color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>{t('network.cells.cellLocationPayload')}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {locationCells.length > 0 ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }} icon={false}>{t('network.cells.locationInfo')}</Alert>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>MCC</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>MNC</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>LAC/TAC</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>CID</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{t('network.cells.signal')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {locationCells.map((cell, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{cell.mcc}</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{cell.mnc}</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{cell.lac}</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace' }}>{cell.cid}</TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{cell.signal_strength} dBm</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button variant="outlined" size="small" startIcon={<ContentCopy />} onClick={onCopyCellLocation} sx={{ mt: 1 }}>{t('common.copyJson')}</Button>
              </>
            ) : (
              <Alert severity="warning" icon={false}>{t('network.cells.noLocationPayload')}</Alert>
            )}
          </AccordionDetails>
        </Accordion>
      </Card>
    </>
  )
}
