import { useState } from 'react'
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { Language, Phone, SimCard, Sms, Visibility, VisibilityOff } from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import { getSensitiveStyle } from '../utils'
import type { SimInfo } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface SimCardInfoProps {
  simInfo: SimInfo | null
}

export function SimCardInfo({ simInfo }: SimCardInfoProps) {
  const [showInfo, setShowInfo] = useState(false)
  const { t } = useI18n()

  const rows = [
    { label: t('dashboard.sim.iccid'), value: simInfo?.iccid || 'N/A', sensitive: true },
    { label: t('dashboard.sim.imsi'), value: simInfo?.imsi || 'N/A', sensitive: true },
    { label: t('dashboard.sim.mccmnc'), value: `${simInfo?.mcc || '?'}/${simInfo?.mnc || '?'}` },
    { label: t('dashboard.sim.phone'), value: simInfo?.phone_numbers?.[0] || 'N/A', sensitive: true, icon: <Phone fontSize="small" color="action" /> },
    { label: t('dashboard.sim.smsc'), value: simInfo?.sms_center || 'N/A', sensitive: true, icon: <Sms fontSize="small" color="action" /> },
  ]

  return (
    <DashboardPanel
      title={t('dashboard.sim.title')}
      subtitle={t('dashboard.sim.subtitle')}
      icon={<SimCard color="primary" />}
      action={(
        <Box display="flex" alignItems="center" gap={0.75}>
          <Chip
            label={simInfo?.present ? t('dashboard.sim.ready') : t('dashboard.sim.missing')}
            color={simInfo?.present ? 'success' : 'error'}
            variant="outlined"
            size="small"
          />
          <Tooltip title={showInfo ? t('common.hideDetails') : t('common.showDetails')}>
            <IconButton size="small" onClick={() => setShowInfo(!showInfo)}>
              {showInfo ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    >
      <Stack spacing={1.1}>
        {rows.map((row) => (
          <Box
            key={row.label}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              px: 1.25,
              py: 1,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            })}
          >
            <Box display="flex" alignItems="center" gap={0.75}>
              {row.icon}
              <Typography variant="caption" color="text.secondary">
                {row.label}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={600}
              fontFamily="monospace"
              sx={row.sensitive ? getSensitiveStyle(showInfo) : undefined}
            >
              {row.value}
            </Typography>
          </Box>
        ))}

        {simInfo?.preferred_languages && simInfo.preferred_languages.length > 0 && (
          <Box
            sx={(theme) => ({
              px: 1.25,
              py: 1.1,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            })}
          >
            <Box display="flex" alignItems="center" gap={0.75} mb={1}>
              <Language fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {t('dashboard.sim.languages')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {simInfo.preferred_languages.slice(0, 4).map((lang) => (
                <Chip key={lang} label={lang.toUpperCase()} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </DashboardPanel>
  )
}
