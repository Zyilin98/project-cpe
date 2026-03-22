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
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Business, Refresh, Search } from '@mui/icons-material'
import type { OperatorListResponse } from '../../../api/types'

interface NetworkOperatorsTabProps {
  operators: OperatorListResponse | null
  scanning: boolean
  registering: boolean
  onRefresh: () => void
  onScan: () => void
  onAutoRegister: () => void
  onManualRegister: (mccmnc: string) => void
}

export default function NetworkOperatorsTab({
  operators,
  scanning,
  registering,
  onRefresh,
  onScan,
  onAutoRegister,
  onManualRegister,
}: NetworkOperatorsTabProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            avatar={<Business color="primary" />}
            title="Operators"
            titleTypographyProps={{ variant: 'h6' }}
            action={
              <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={onRefresh}>
                Refresh
              </Button>
            }
          />
          <CardContent>
            {operators?.operators?.length ? (
              <List>
                {operators.operators.map((operator, index) => (
                  <ListItem key={`${operator.mcc}-${operator.mnc}-${index}`} divider>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontWeight={600}>{operator.name}</Typography>
                          <Chip
                            label={operator.status}
                            size="small"
                            color={
                              operator.status === 'current'
                                ? 'success'
                                : operator.status === 'available'
                                  ? 'primary'
                                  : 'default'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            MCC-MNC: {operator.mcc}-{operator.mnc}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Technologies: {operator.technologies?.join(', ') || 'N/A'}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {operator.status !== 'current' && operator.status !== 'forbidden' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onManualRegister(`${operator.mcc}${operator.mnc}`)}
                          disabled={registering}
                        >
                          Register
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No operator data is available yet.</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            avatar={<Search color="primary" />}
            title="Discovery"
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Scanning for operators can take around 2 minutes and may interrupt connectivity while the modem searches.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              startIcon={scanning ? <CircularProgress size={20} color="inherit" /> : <Search />}
              onClick={onScan}
              disabled={scanning}
              sx={{ mb: 2 }}
            >
              {scanning ? 'Scanning...' : 'Scan available operators'}
            </Button>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="outlined"
              fullWidth
              startIcon={registering ? <CircularProgress size={20} /> : <Refresh />}
              onClick={onAutoRegister}
              disabled={registering}
            >
              {registering ? 'Registering...' : 'Auto register operator'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
