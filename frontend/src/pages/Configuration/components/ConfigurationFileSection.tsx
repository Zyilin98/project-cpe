import type { SyntheticEvent } from 'react'
import { useRef } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import {
  ExpandMore,
  CloudUpload,
  Delete,
  InsertDriveFile,
  Folder,
  Refresh,
} from '@mui/icons-material'
import { useI18n } from '@/contexts/I18nContext'
import ConfigurationSectionHeader from './ConfigurationSectionHeader'
import type { FileInfo } from '@/api/types'

interface ConfigurationFileSectionProps {
  expanded: boolean
  onChange: (event: SyntheticEvent, isExpanded: boolean) => void
  files: FileInfo[]
  uploading: boolean
  onUpload: (file: File) => void
  onDelete: (filename: string) => void
  onRefresh: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function ConfigurationFileSection({
  expanded,
  onChange,
  files,
  uploading,
  onUpload,
  onDelete,
  onRefresh,
}: ConfigurationFileSectionProps) {
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
      // Reset input so the same file can be selected again
      event.target.value = ''
    }
  }

  return (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <ConfigurationSectionHeader
          icon={<Folder color="primary" />}
          title={t('configuration.files.title')}
          statusLabel={`${files.length} ${t('configuration.files.fileCount')}`}
          statusColor="default"
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('configuration.files.description')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Upload area */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleFileSelect}
            disabled={uploading}
          >
            {uploading ? t('configuration.files.uploading') : t('configuration.files.upload')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={onRefresh}
          >
            {t('common.refresh')}
          </Button>
          <Chip
            label={t('configuration.files.maxSize')}
            size="small"
            variant="outlined"
          />
        </Box>

        {uploading && <LinearProgress sx={{ mb: 2 }} />}

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('configuration.files.targetDir')}: <code>/tmp</code>
        </Alert>

        {/* File list */}
        {files.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('configuration.files.noFiles')}
          </Typography>
        ) : (
          <List dense sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            {files.map((file, index) => (
              <ListItem
                key={file.name}
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    size="small"
                    onClick={() => onDelete(file.name)}
                    title={t('configuration.files.delete')}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                }
                divider={index < files.length - 1}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InsertDriveFile fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {file.name}
                    </Typography>
                  }
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </AccordionDetails>
    </Accordion>
  )
}
