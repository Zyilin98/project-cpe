import type { ChangeEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { SimCard } from '@mui/icons-material'
import type { ApnContext } from '../../../api/types'

interface ApnFormState {
  apn: string
  protocol: string
  username: string
  password: string
  auth_method: string
}

interface NetworkApnTabProps {
  apnContexts: ApnContext[]
  selectedContext: string
  apnForm: ApnFormState
  apnSaving: boolean
  onContextChange: (path: string) => void
  onFormChange: (patch: Partial<ApnFormState>) => void
  onSave: () => void
  getProtocolName: (protocol: string) => string
}

export default function NetworkApnTab({
  apnContexts,
  selectedContext,
  apnForm,
  apnSaving,
  onContextChange,
  onFormChange,
  onSave,
  getProtocolName,
}: NetworkApnTabProps) {
  const selectedContextInfo = apnContexts.find((context) => context.path === selectedContext)

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardHeader
            avatar={<SimCard color="primary" />}
            title="APN Configuration"
            titleTypographyProps={{ variant: 'h6' }}
            subheader="Set the access point parameters used for mobile data sessions."
          />
          <CardContent>
            {apnContexts.length === 0 ? (
              <Alert severity="warning">No APN contexts are available for this modem.</Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={2.5}>
                <FormControl fullWidth>
                  <InputLabel>Select APN context</InputLabel>
                  <Select
                    value={selectedContext}
                    label="Select APN context"
                    onChange={(event) => onContextChange(event.target.value)}
                  >
                    {apnContexts.map((context) => (
                      <MenuItem key={context.path} value={context.path}>
                        <Box display="flex" alignItems="center" gap={1} width="100%" flexWrap="wrap">
                          <Typography>{context.name} ({context.path.split('/').pop()})</Typography>
                          {context.active && <Chip label="Active" size="small" color="success" />}
                          {context.apn && <Chip label={context.apn} size="small" variant="outlined" />}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Divider />

                <TextField
                  label="APN name"
                  value={apnForm.apn}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => onFormChange({ apn: event.target.value })}
                  fullWidth
                  placeholder="Examples: cbnet, cmnet, 3gnet"
                  helperText="Use the APN provided by your carrier."
                />

                <FormControl fullWidth>
                  <InputLabel>IP protocol</InputLabel>
                  <Select
                    value={apnForm.protocol}
                    label="IP protocol"
                    onChange={(event) => onFormChange({ protocol: event.target.value })}
                  >
                    <MenuItem value="ip">IPv4</MenuItem>
                    <MenuItem value="ipv6">IPv6</MenuItem>
                    <MenuItem value="dual">IPv4v6 (Recommended)</MenuItem>
                  </Select>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Username"
                      value={apnForm.username}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => onFormChange({ username: event.target.value })}
                      fullWidth
                      placeholder="Optional"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Password"
                      type="password"
                      value={apnForm.password}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => onFormChange({ password: event.target.value })}
                      fullWidth
                      placeholder="Optional"
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>Authentication</InputLabel>
                  <Select
                    value={apnForm.auth_method}
                    label="Authentication"
                    onChange={(event) => onFormChange({ auth_method: event.target.value })}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="pap">PAP</MenuItem>
                    <MenuItem value="chap">CHAP (Recommended)</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={onSave}
                  disabled={apnSaving || !selectedContext || !apnForm.apn}
                  startIcon={apnSaving ? <CircularProgress size={20} /> : undefined}
                >
                  {apnSaving ? 'Saving...' : 'Save APN'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        {selectedContextInfo && (
          <Card sx={{ mb: 2 }}>
            <CardHeader title="Current context status" titleTypographyProps={{ variant: 'subtitle1' }} />
            <CardContent>
              <Stack spacing={1}>
                <Chip
                  label={selectedContextInfo.active ? 'Active' : 'Inactive'}
                  color={selectedContextInfo.active ? 'success' : 'default'}
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Chip
                  label={`Protocol: ${getProtocolName(selectedContextInfo.protocol || 'ip')}`}
                  variant="outlined"
                  sx={{ justifyContent: 'flex-start' }}
                />
                {selectedContextInfo.apn && (
                  <Chip
                    label={`APN: ${selectedContextInfo.apn}`}
                    color="primary"
                    variant="outlined"
                    sx={{ justifyContent: 'flex-start' }}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title="Common carrier APNs" titleTypographyProps={{ variant: 'subtitle1' }} />
          <CardContent>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>China Mobile</strong></TableCell>
                  <TableCell>cmnet</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>China Unicom</strong></TableCell>
                  <TableCell>3gnet / 3gwap</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>China Telecom</strong></TableCell>
                  <TableCell>ctnet / ctlte</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>China Broadnet</strong></TableCell>
                  <TableCell>cbnet</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
