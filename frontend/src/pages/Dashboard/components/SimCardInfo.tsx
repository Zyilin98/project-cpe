import { useState } from 'react'
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { Language, Phone, SimCard, Sms, Visibility, VisibilityOff } from '@mui/icons-material'
import { getSensitiveStyle } from '../utils'
import type { SimInfo } from '@/api/types'
import { DashboardPanel } from './DashboardPanel'

interface SimCardInfoProps {
  simInfo: SimInfo | null
}

export function SimCardInfo({ simInfo }: SimCardInfoProps) {
  const [showInfo, setShowInfo] = useState(false)

  const rows = [
    { label: 'ICCID', value: simInfo?.iccid || 'N/A', sensitive: true },
    { label: 'IMSI', value: simInfo?.imsi || 'N/A', sensitive: true },
    { label: 'MCC/MNC', value: `${simInfo?.mcc || '?'}/${simInfo?.mnc || '?'}` },
    { label: 'Phone', value: simInfo?.phone_numbers?.[0] || 'N/A', sensitive: true, icon: <Phone fontSize="small" color="action" /> },
    { label: 'SMSC', value: simInfo?.sms_center || 'N/A', sensitive: true, icon: <Sms fontSize="small" color="action" /> },
  ]

  return (
    <DashboardPanel
      title="SIM Profile"
      subtitle="Identity, language and line metadata"
      icon={<SimCard color="primary" />}
      action={(
        <Box display="flex" alignItems="center" gap={0.75}>
          <Chip
            label={simInfo?.present ? 'Ready' : 'Missing'}
            color={simInfo?.present ? 'success' : 'error'}
            variant="outlined"
            size="small"
          />
          <Tooltip title={showInfo ? 'Hide details' : 'Show details'}>
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
                Languages
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
