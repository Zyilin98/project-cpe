import type { ChangeEvent, ReactElement } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import type { ChipProps } from '@mui/material/Chip'
import { Router, NetworkCheck, SignalCellularAlt } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import type { IpAddress, NetworkInterfaceInfo } from '../../../api/types'

interface NetworkInterfacesTabProps {
  interfaces: NetworkInterfaceInfo[]
  filteredInterfaces: NetworkInterfaceInfo[]
  showIpAddresses: boolean
  onShowIpAddressesChange: (value: boolean) => void
  showDownInterfaces: boolean
  onShowDownInterfacesChange: (value: boolean) => void
  getInterfaceStatusColor: (status: string) => ChipProps['color']
  getScopeIcon: (scope: string) => ReactElement
  getScopeColor: (scope: string) => ChipProps['color']
  getScopeLabel: (scope: string) => string
  getIpAddressStyle: () => Record<string, unknown>
  formatBytes: (bytes: number) => string
}

export default function NetworkInterfacesTab({
  interfaces,
  filteredInterfaces,
  showIpAddresses,
  onShowIpAddressesChange,
  showDownInterfaces,
  onShowDownInterfacesChange,
  getInterfaceStatusColor,
  getScopeIcon,
  getScopeColor,
  getScopeLabel,
  getIpAddressStyle,
  formatBytes,
}: NetworkInterfacesTabProps) {
  const { formatNumber, t } = useI18n()
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControlLabel
            control={
              <Switch
                checked={showIpAddresses}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onShowIpAddressesChange(event.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2" color="text.secondary">{t('network.interfaces.showIpAddresses')}</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showDownInterfaces}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onShowDownInterfacesChange(event.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2" color="text.secondary">{t('network.interfaces.showDownInterfaces')}</Typography>}
          />
        </Box>
        <Chip icon={<Router />} label={t('network.interfaces.count', { shown: filteredInterfaces.length, total: interfaces.length })} color="primary" />
      </Box>

      <Grid container spacing={2}>
        {filteredInterfaces.map((iface) => (
          <Grid key={iface.name} size={12}>
            <Card>
              <CardHeader
                avatar={<NetworkCheck color="primary" />}
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{iface.name}</Typography>
                    <Chip
                      label={iface.status.toUpperCase()}
                      size="small"
                      color={getInterfaceStatusColor(iface.status)}
                    />
                  </Box>
                }
                subheader={
                  <Box display="flex" gap={2} mt={0.5} flexWrap="wrap">
                    {iface.mac_address && (
                      <Typography variant="caption" color="text.secondary">
                        {t('network.interfaces.mac')}: {iface.mac_address}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {t('network.interfaces.mtu')}: {iface.mtu}
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SignalCellularAlt fontSize="small" />
                      {t('network.interfaces.ipAddresses')}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {iface.ip_addresses.length > 0 ? (
                      <Stack spacing={1}>
                        {iface.ip_addresses.map((ip: IpAddress, index: number) => (
                          <Box
                            key={`${iface.name}-${ip.address}-${index}`}
                            sx={{
                              p: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <Chip
                                icon={getScopeIcon(ip.scope)}
                                label={getScopeLabel(ip.scope)}
                                size="small"
                                color={getScopeColor(ip.scope)}
                              />
                              <Chip label={ip.ip_type.toUpperCase()} size="small" variant="outlined" />
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', ...getIpAddressStyle() }}>
                              {ip.address}/{ip.prefix_len}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('network.interfaces.noIpAddresses')}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SignalCellularAlt fontSize="small" />
                      {t('network.interfaces.trafficCounters')}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('network.interfaces.direction')}</TableCell>
                            <TableCell align="right">{t('network.interfaces.bytes')}</TableCell>
                            <TableCell align="right">{t('network.interfaces.packets')}</TableCell>
                            <TableCell align="right">{t('network.interfaces.errors')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell><Chip label={t('network.interfaces.rx')} size="small" color="info" /></TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatBytes(iface.rx_bytes)}</TableCell>
                            <TableCell align="right">{formatNumber(iface.rx_packets)}</TableCell>
                            <TableCell align="right">
                              <Chip label={iface.rx_errors} size="small" color={iface.rx_errors > 0 ? 'error' : 'default'} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><Chip label={t('network.interfaces.tx')} size="small" color="warning" /></TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatBytes(iface.tx_bytes)}</TableCell>
                            <TableCell align="right">{formatNumber(iface.tx_packets)}</TableCell>
                            <TableCell align="right">
                              <Chip label={iface.tx_errors} size="small" color={iface.tx_errors > 0 ? 'error' : 'default'} />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredInterfaces.length === 0 && interfaces.length > 0 && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {t('network.interfaces.allDown')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  )
}
