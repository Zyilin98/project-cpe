import type { ReactNode } from 'react'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@/utils/theme'

interface PageHeroProps {
  eyebrow: string
  title: string
  description: string
  chips?: string[]
  actions?: ReactNode
}

export default function PageHero({
  eyebrow,
  title,
  description,
  chips = [],
  actions,
}: PageHeroProps) {
  return (
    <Paper
      sx={(theme) => ({
        p: { xs: 2.5, md: 3 },
        mb: 3,
        borderRadius: 5,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.88 : 0.94)} 50%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)} 100%)`,
      })}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        flexWrap="wrap"
        position="relative"
        zIndex={1}
      >
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            {eyebrow}
          </Typography>
          <Typography variant="h4">{title}</Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={820}>
            {description}
          </Typography>
          {chips.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {chips.map((chip) => (
                <Chip key={chip} label={chip} variant="outlined" />
              ))}
            </Stack>
          )}
        </Stack>
        {actions}
      </Box>
    </Paper>
  )
}
