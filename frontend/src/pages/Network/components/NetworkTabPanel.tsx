import type { ReactNode } from 'react'
import { Box } from '@mui/material'

interface NetworkTabPanelProps {
  children?: ReactNode
  index: number
  value: number
}

export default function NetworkTabPanel({
  children,
  value,
  index,
}: NetworkTabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}
