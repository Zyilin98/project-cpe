import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Typography, type SxProps, type Theme } from '@mui/material'
import { alpha } from '@/utils/theme'

interface DashboardPanelProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  sx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

export function DashboardPanel({
  title,
  subtitle,
  icon,
  action,
  children,
  sx,
  contentSx,
}: DashboardPanelProps) {
  return (
    <Card
      sx={[
        (theme) => ({
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.88 : 0.94)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.72 : 0.82)} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 42%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            pointerEvents: 'none',
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <CardContent
        sx={[
          {
            position: 'relative',
            zIndex: 1,
            p: 2.25,
            '&:last-child': {
              pb: 2.25,
            },
          },
          ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : []),
        ]}
      >
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} mb={2}>
          <Stack spacing={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              {icon}
              <Typography variant="subtitle1">{title}</Typography>
            </Box>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  )
}
