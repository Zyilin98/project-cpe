import type { ReactNode } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'

interface ConfigurationSectionHeaderProps {
  icon: ReactNode
  title: string
  statusLabel: string
  statusColor?: ChipProps['color']
}

export default function ConfigurationSectionHeader({
  icon,
  title,
  statusLabel,
  statusColor = 'default',
}: ConfigurationSectionHeaderProps) {
  return (
    <Box display="flex" alignItems="center" gap={1} width="100%">
      {icon}
      <Typography fontWeight={600}>{title}</Typography>
      <Box flexGrow={1} />
      <Chip
        label={statusLabel}
        color={statusColor}
        size="small"
        onClick={(event) => event.stopPropagation()}
      />
    </Box>
  )
}
