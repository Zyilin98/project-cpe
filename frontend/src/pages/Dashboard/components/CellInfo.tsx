import { useState, type MouseEvent } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  type Theme,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@/utils/theme'
import { CellTower, ExpandLess, ExpandMore, Info, Visibility, VisibilityOff } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import { getSensitiveStyle, formatSignalValue, getSignalChipColor } from '../utils'
import type { CellsResponse } from '@/api/types'

interface CellInfoProps {
  cellsInfo: CellsResponse | null
}

export function CellInfo({ cellsInfo }: CellInfoProps) {
  const [expanded, setExpanded] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const { t } = useI18n()

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)} 0%, transparent 100%)`,
        })}
        onClick={() => setExpanded(!expanded)}
      >
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <CellTower fontSize="small" color="primary" />
          <Typography variant="subtitle1">{t('dashboard.cells.title')}</Typography>
          <Chip label={t('dashboard.cells.count', { count: cellsInfo?.cells?.length || 0 })} size="small" variant="outlined" />
          <Tooltip title={showInfo ? t('dashboard.cells.hideSensitive') : t('dashboard.cells.showSensitive')}>
            <IconButton
              size="small"
              onClick={(event: MouseEvent) => {
                event.stopPropagation()
                setShowInfo(!showInfo)
              }}
            >
              {showInfo ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0.5 }}>
          {cellsInfo?.serving_cell && (
            <Box
              sx={(theme) => ({
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mb: 1.5,
                p: 1.25,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
                ...getSensitiveStyle(showInfo),
              })}
            >
              <Chip label={cellsInfo.serving_cell.tech?.toUpperCase() || '-'} size="small" color="primary" />
              <Typography variant="caption" color="text.secondary">
                CID <strong>{cellsInfo.serving_cell.cell_id}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                TAC <strong>{cellsInfo.serving_cell.tac}</strong>
              </Typography>
            </Box>
          )}

          <TableContainer sx={{ borderRadius: 4, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t('dashboard.cells.band')}</TableCell>
                  <TableCell align="right">{t('dashboard.cells.arfcn')}</TableCell>
                  <TableCell align="right">{t('dashboard.cells.pci')}</TableCell>
                  <TableCell align="right">{t('dashboard.cells.rsrp')}</TableCell>
                  <TableCell align="right">{t('dashboard.cells.rsrq')}</TableCell>
                  <TableCell align="right">{t('dashboard.cells.sinr')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cellsInfo?.cells && cellsInfo.cells.length > 0 ? (
                  cellsInfo.cells.map((cell, idx) => (
                    <TableRow
                      key={`${cell.arfcn || idx}-${cell.pci || idx}`}
                      sx={{
                        bgcolor: cell.is_serving
                          ? (theme: Theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)
                          : 'inherit',
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          {cell.is_serving && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Typography variant="caption" fontWeight={cell.is_serving ? 700 : 500}>
                            {cell.band && cell.band !== '0' ? cell.band : '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{cell.arfcn || '-'}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{cell.pci || '-'}</TableCell>
                      <TableCell align="right">
                        {cell.rsrp !== undefined ? (
                          <Chip
                            label={formatSignalValue(cell.rsrp)}
                            size="small"
                            color={getSignalChipColor(cell.rsrp)}
                            sx={{ height: 22 }}
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatSignalValue(cell.rsrq)}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatSignalValue(cell.sinr)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1} py={2}>
                        <Info fontSize="small" color="disabled" />
                        <Typography variant="body2" color="text.secondary">
                          {t('dashboard.cells.noInfo')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Collapse>
    </Card>
  )
}
