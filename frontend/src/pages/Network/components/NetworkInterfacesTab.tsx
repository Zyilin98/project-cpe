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
            label={<Typography variant="body2" color="text.secondary">Show IP addresses</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showDownInterfaces}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onShowDownInterfacesChange(event.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2" color="text.secondary">Show down interfaces</Typography>}
          />
        </Box>
        <Chip icon={<Router />} label={`${filteredInterfaces.length} / ${interfaces.length}`} color="primary" />
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
                        MAC: {iface.mac_address}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      MTU: {iface.mtu}
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SignalCellularAlt fontSize="small" />
                      IP addresses
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
                        No IP addresses
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SignalCellularAlt fontSize="small" />
                      Traffic counters
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Direction</TableCell>
                            <TableCell align="right">Bytes</TableCell>
                            <TableCell align="right">Packets</TableCell>
                            <TableCell align="right">Errors</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell><Chip label="RX" size="small" color="info" /></TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatBytes(iface.rx_bytes)}</TableCell>
                            <TableCell align="right">{iface.rx_packets.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Chip label={iface.rx_errors} size="small" color={iface.rx_errors > 0 ? 'error' : 'default'} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><Chip label="TX" size="small" color="warning" /></TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatBytes(iface.tx_bytes)}</TableCell>
                            <TableCell align="right">{iface.tx_packets.toLocaleString()}</TableCell>
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
                Every interface is currently down. Enable "Show down interfaces" to inspect the full list.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  )
}
