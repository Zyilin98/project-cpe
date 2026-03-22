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
import { useI18n } from '@/contexts/I18nContext'
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
  const { t } = useI18n()

  const getOperatorStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return t('network.operators.current')
      case 'available':
        return t('network.operators.available')
      case 'forbidden':
        return t('network.operators.forbidden')
      default:
        return status
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            avatar={<Business color="primary" />}
            title={t('network.operators.title')}
            titleTypographyProps={{ variant: 'h6' }}
            action={
              <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={onRefresh}>
                {t('network.operators.refresh')}
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
                            label={getOperatorStatusLabel(operator.status)}
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
                            {t('network.operators.mccmnc')}: {operator.mcc}-{operator.mnc}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {t('network.operators.technologies')}: {operator.technologies?.join(', ') || t('common.na')}
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
                          {t('network.operators.register')}
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">{t('network.operators.noData')}</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader
            avatar={<Search color="primary" />}
            title={t('network.operators.discovery')}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('network.operators.scanWarning')}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              startIcon={scanning ? <CircularProgress size={20} color="inherit" /> : <Search />}
              onClick={onScan}
              disabled={scanning}
              sx={{ mb: 2 }}
            >
              {scanning ? t('network.operators.scanning') : t('network.operators.scan')}
            </Button>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="outlined"
              fullWidth
              startIcon={registering ? <CircularProgress size={20} /> : <Refresh />}
              onClick={onAutoRegister}
              disabled={registering}
            >
              {registering ? t('network.operators.registering') : t('network.operators.autoRegister')}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
