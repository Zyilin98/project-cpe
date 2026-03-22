import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import type { Theme } from '@mui/material/styles'
import {
  Add,
  ArrowBack,
  DeleteSweep,
  Person,
  Refresh,
  Send,
  Sms as SmsIcon,
} from '@mui/icons-material'
import { api, type SmsMessage, type SmsStats } from '../api'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import { useI18n } from '../contexts/I18nContext'
import { alpha } from '../utils/theme'

interface ConversationGroup {
  phoneNumber: string
  messages: SmsMessage[]
  lastMessage: SmsMessage
  unreadCount: number
}

export default function SMSPage() {
  const { t, formatDate, formatTime: formatLocaleTime } = useI18n()
  const isMobile = useMediaQuery<Theme>((theme: Theme) => theme.breakpoints.down('md'))

  const [messages, setMessages] = useState<SmsMessage[]>([])
  const [stats, setStats] = useState<SmsStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false)
  const [newChatNumber, setNewChatNumber] = useState('')

  const [conversations, setConversations] = useState<ConversationGroup[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationMessages, setConversationMessages] = useState<SmsMessage[]>([])
  const [conversationLoading, setConversationLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputFocusedRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const groupConversations = useCallback((items: SmsMessage[]) => {
    const groups = new Map<string, SmsMessage[]>()

    items.forEach((message) => {
      const key = message.phone_number
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)?.push(message)
    })

    const conversationList: ConversationGroup[] = []
    groups.forEach((groupMessages, number) => {
      groupMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      conversationList.push({
        phoneNumber: number,
        messages: groupMessages,
        lastMessage: groupMessages[0],
        unreadCount: groupMessages.filter((message) => message.direction === 'incoming' && message.status === 'received').length,
      })
    })

    conversationList.sort(
      (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime(),
    )

    setConversations(conversationList)
  }, [])

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getSmsList({ limit: 100, offset: 0 })
      if (response.status === 'ok' && response.data) {
        setMessages(response.data)
        groupConversations(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [groupConversations])

  const fetchConversation = useCallback(
    async (phone: string) => {
      setConversationLoading(true)
      try {
        const response = await api.getSmsConversation({ phone_number: phone })
        if (response.status === 'ok' && response.data) {
          const sorted = [...response.data].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          setConversationMessages(sorted)
          setTimeout(scrollToBottom, 100)
        }
      } catch {
        const localMessages = messages.filter((message) => message.phone_number === phone)
        const sorted = [...localMessages].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        setConversationMessages(sorted)
        setTimeout(scrollToBottom, 100)
      } finally {
        setConversationLoading(false)
      }
    },
    [messages, scrollToBottom],
  )

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.getSmsStats()
      if (response.status === 'ok' && response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Failed to load SMS stats:', err)
    }
  }, [])

  useEffect(() => {
    void fetchMessages()
    void fetchStats()

    const interval = setInterval(() => {
      if (inputFocusedRef.current) {
        return
      }
      void fetchMessages()
      void fetchStats()
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchMessages, fetchStats])

  const handleSelectConversation = (phone: string) => {
    setSelectedConversation(phone)
    setPhoneNumber(phone)
    void fetchConversation(phone)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
    setConversationMessages([])
  }

  const handleStartNewChat = () => {
    if (!newChatNumber.trim()) {
      setError(t('sms.actions.enterPhoneNumber'))
      return
    }

    setNewChatDialogOpen(false)
    setSelectedConversation(newChatNumber)
    setPhoneNumber(newChatNumber)
    setConversationMessages([])
    setNewChatNumber('')
  }

  const handleSend = async () => {
    if (!phoneNumber.trim()) {
      setError(t('sms.actions.enterPhoneNumber'))
      return
    }
    if (!content.trim()) {
      setError(t('sms.actions.enterMessage'))
      return
    }

    setSendLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.sendSms(phoneNumber, content)
      if (response.status === 'ok') {
        setSuccess(t('sms.actions.messageSent', { number: phoneNumber }))
        setContent('')
        setTimeout(() => {
          void fetchMessages()
          void fetchStats()
          if (selectedConversation) {
            void fetchConversation(selectedConversation)
          }
        }, 1000)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSendLoading(false)
    }
  }

  const handleClearAll = async () => {
    setError(null)
    setSuccess(null)
    setClearDialogOpen(false)

    try {
      const response = await api.clearAllSms()
      if (response.status === 'ok') {
        setSuccess(t('sms.actions.clearedAll'))
        setMessages([])
        setConversations([])
        setSelectedConversation(null)
        void fetchStats()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      if (isToday) {
        return formatLocaleTime(date)
      }
      return formatDate(date, {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  const formatShortTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      if (isToday) {
        return formatLocaleTime(date)
      }
      return formatDate(date, { month: '2-digit', day: '2-digit' })
    } catch {
      return timestamp
    }
  }

  const unreadCount = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)

  const conversationListContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {stats && (
        <Box display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap={1.25} p={2}>
          <Paper sx={{ p: 1.25, textAlign: 'center', borderRadius: 3, bgcolor: 'surfaceContainer.main' }}>
            <Typography variant="h6" color="primary.main" fontWeight={700}>
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('sms.list.total')}
            </Typography>
          </Paper>
          <Paper sx={{ p: 1.25, textAlign: 'center', borderRadius: 3, bgcolor: 'surfaceContainer.main' }}>
            <Typography variant="h6" color="success.main" fontWeight={700}>
              {stats.incoming}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('sms.list.incoming')}
            </Typography>
          </Paper>
          <Paper sx={{ p: 1.25, textAlign: 'center', borderRadius: 3, bgcolor: 'surfaceContainer.main' }}>
            <Typography variant="h6" color="info.main" fontWeight={700}>
              {stats.outgoing}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('sms.list.outgoing')}
            </Typography>
          </Paper>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" px={2} pb={1.5}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('sms.list.conversations')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('sms.list.threadsCount', { count: conversations.length })}
          </Typography>
        </Box>
        <Box display="flex" gap={0.5}>
          <IconButton size="small" color="primary" onClick={() => setNewChatDialogOpen(true)}>
            <Add />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => void fetchMessages()} disabled={loading}>
            <Refresh />
          </IconButton>
          {conversations.length > 0 && (
            <IconButton size="small" color="error" onClick={() => setClearDialogOpen(true)}>
              <DeleteSweep />
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider />

      {loading && conversations.length === 0 ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : conversations.length === 0 ? (
        <Box p={2}>
          <Alert severity="info">{t('sms.list.noConversations')}</Alert>
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
          {conversations.map((conversation, index) => (
            <Box key={conversation.phoneNumber}>
              <ListItemButton
                onClick={() => handleSelectConversation(conversation.phoneNumber)}
                selected={selectedConversation === conversation.phoneNumber}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 3,
                  alignItems: 'flex-start',
                }}
              >
                <Avatar sx={{ mr: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Person />
                </Avatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                      <Typography fontWeight={700} noWrap>
                        {conversation.phoneNumber}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Badge badgeContent={conversation.unreadCount} color="primary" max={99} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                      {conversation.lastMessage.direction === 'outgoing' ? t('sms.list.youPrefix') : ''}
                      {conversation.lastMessage.content}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ pl: 1, whiteSpace: 'nowrap' }}>
                  {formatShortTime(conversation.lastMessage.timestamp)}
                </Typography>
              </ListItemButton>
              {index < conversations.length - 1 && <Divider sx={{ mx: 2 }} />}
            </Box>
          ))}
        </List>
      )}
    </Box>
  )

  const chatAreaContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          backgroundColor: 'surfaceContainer.main',
        }}
      >
        {isMobile && (
          <IconButton onClick={handleBackToList} edge="start">
            <ArrowBack />
          </IconButton>
        )}
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Person />
        </Avatar>
        <Box minWidth={0}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {selectedConversation}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('sms.chat.threadLabel')}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={(theme) => ({
          flex: 1,
          overflow: 'auto',
          p: 2,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        })}
      >
        {conversationLoading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : conversationMessages.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">{t('sms.chat.empty')}</Typography>
          </Box>
        ) : (
          <>
            {conversationMessages.map((message, index) => (
              <Box
                key={message.id || index}
                display="flex"
                justifyContent={message.direction === 'outgoing' ? 'flex-end' : 'flex-start'}
                mb={1.5}
              >
                <Paper
                  elevation={0}
                  sx={(theme) => ({
                    p: 1.5,
                    maxWidth: '78%',
                    borderRadius: 4,
                    borderTopRightRadius: message.direction === 'outgoing' ? 1 : 4,
                    borderTopLeftRadius: message.direction === 'incoming' ? 1 : 4,
                    color: message.direction === 'outgoing' ? 'primary.contrastText' : 'text.primary',
                    background:
                      message.direction === 'outgoing'
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        : theme.palette.background.paper,
                    border:
                      message.direction === 'outgoing'
                        ? 'none'
                        : `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  })}
                >
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.75} mt={0.75}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {formatMessageTime(message.timestamp)}
                    </Typography>
                    {message.direction === 'outgoing' && message.status === 'sent' && (
                      <Chip label={t('sms.statuses.sent')} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.18)', color: 'inherit' }} />
                    )}
                    {message.direction === 'outgoing' && message.status === 'failed' && (
                      <Chip label={t('sms.statuses.failed')} size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                </Paper>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={content}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setContent(event.target.value)}
          placeholder={t('sms.chat.sendPlaceholder')}
          disabled={sendLoading}
          onFocus={() => {
            inputFocusedRef.current = true
          }}
          onBlur={() => {
            inputFocusedRef.current = false
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void handleSend()
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={() => void handleSend()} disabled={sendLoading || !content.trim()}>
                    {sendLoading ? <CircularProgress size={24} /> : <Send />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          {t('sms.chat.helper', { count: content.length })}
        </Typography>
      </Box>
    </Box>
  )

  const emptyStateContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <SmsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {t('sms.emptyState.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('sms.emptyState.subtitle')}
      </Typography>
    </Box>
  )

  return (
    <Box>
      <PageHero
        eyebrow={t('sms.page.eyebrow')}
        title={t('sms.page.title')}
        description={t('sms.page.description')}
        chips={[
          t('sms.page.threads', { count: conversations.length }),
          t('sms.page.unread', { count: unreadCount }),
          selectedConversation ? t('sms.page.activeThread', { phone: selectedConversation }) : t('sms.page.noThreadSelected'),
        ]}
      />

      <ErrorSnackbar error={error} onClose={() => setError(null)} />
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(null)} variant="filled">
          {success}
        </Alert>
      </Snackbar>

      <Paper
        sx={(theme) => ({
          height: { xs: 'calc(100vh - 260px)', md: 'calc(100vh - 235px)' },
          minHeight: 560,
          overflow: 'hidden',
          borderRadius: 6,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.84 : 0.92),
        })}
      >
        {isMobile ? (
          selectedConversation ? chatAreaContent : conversationListContent
        ) : (
          <Box display="flex" height="100%">
            <Box
              sx={{
                width: 340,
                borderRight: 1,
                borderColor: 'divider',
                flexShrink: 0,
                backgroundColor: 'background.paper',
              }}
            >
              {conversationListContent}
            </Box>
            <Box sx={{ flex: 1 }}>{selectedConversation ? chatAreaContent : emptyStateContent}</Box>
          </Box>
        )}
      </Paper>

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('sms.dialogs.clearTitle')}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {t('sms.dialogs.clearBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>{t('sms.dialogs.cancel')}</Button>
          <Button onClick={() => void handleClearAll()} color="error" variant="contained">
            {t('sms.dialogs.clearAll')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newChatDialogOpen} onClose={() => setNewChatDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('sms.dialogs.newTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('sms.dialogs.phoneNumber')}
            value={newChatNumber}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setNewChatNumber(event.target.value)}
            placeholder={t('sms.dialogs.recipientPlaceholder')}
            sx={{ mt: 1 }}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                handleStartNewChat()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatDialogOpen(false)}>{t('sms.dialogs.cancel')}</Button>
          <Button onClick={handleStartNewChat} variant="contained">
            {t('sms.dialogs.openThread')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
