import { useEffect, useState, type SyntheticEvent } from 'react'
import { api } from '../../../api'
import { DEFAULT_CALL_TEMPLATE, DEFAULT_SMS_TEMPLATE } from '../../../api/types'
import { useI18n } from '@/contexts/I18nContext'
import type { AirplaneModeResponse, UsbModeResponse, WebhookConfig, ScheduledRebootConfig, AdbTcpStatus, FileInfo } from '../../../api/types'

export interface HealthStatus {
  status: string
  timestamp?: string
}

export default function useConfigurationPageController() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | false>('dataConnection')

  const [dataStatus, setDataStatus] = useState(false)
  const [usbMode, setUsbMode] = useState<UsbModeResponse | null>(null)
  const [selectedUsbMode, setSelectedUsbMode] = useState<number>(1)
  const [usbModePermanent, setUsbModePermanent] = useState(false)
  const [useHotSwitch, setUseHotSwitch] = useState(false)
  const [rebooting, setRebooting] = useState(false)
  const [hotSwitching, setHotSwitching] = useState(false)

  const [airplaneMode, setAirplaneMode] = useState<AirplaneModeResponse | null>(null)
  const [airplaneSwitching, setAirplaneSwitching] = useState(false)

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    enabled: false,
    url: '',
    forward_sms: true,
    forward_calls: true,
    headers: {},
    secret: '',
    sms_template: DEFAULT_SMS_TEMPLATE,
    call_template: DEFAULT_CALL_TEMPLATE,
  })
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [webhookTesting, setWebhookTesting] = useState(false)
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  // ===== 定时重启 & 系统管理 =====
  const [scheduledReboot, setScheduledReboot] = useState<ScheduledRebootConfig>({
    enabled: false,
    mode: 'daily',
    daily_time: '04:00',
  })
  const [scheduledRebootSaving, setScheduledRebootSaving] = useState(false)
  const [adbTcpStatus, setAdbTcpStatus] = useState<AdbTcpStatus | null>(null)

  // ===== 文件管理 =====
  const [files, setFiles] = useState<FileInfo[]>([])
  const [filesUploading, setFilesUploading] = useState(false)

  const checkHealth = async () => {
    setHealthLoading(true)
    try {
      const response = await api.health()
      setHealthStatus({
        status: response.status,
        timestamp: new Date().toISOString(),
      })
    } catch {
      setHealthStatus({
        status: 'error',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setHealthLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [dataRes, usbRes, airplaneModeRes, webhookRes, adbRes, sysRes, fileRes] = await Promise.all([
        api.getDataStatus(),
        api.getUsbMode(),
        api.getAirplaneMode(),
        api.getWebhookConfig(),
        api.getAdbTcpStatus().catch(() => ({ data: null })),
        api.getScheduledReboot().catch(() => ({ data: null })),
        api.getFileList().catch(() => ({ data: null })),
      ])

      if (dataRes.data) {
        setDataStatus(dataRes.data.active)
      }

      if (usbRes.data) {
        setUsbMode(usbRes.data)
        setSelectedUsbMode(usbRes.data.current_mode || 1)
      }

      if (airplaneModeRes.data) {
        setAirplaneMode(airplaneModeRes.data)
      }

      if (webhookRes.data) {
        setWebhookConfig(webhookRes.data)
      }

      if (adbRes.data) {
        setAdbTcpStatus(adbRes.data)
      }

      if (sysRes.data) {
        setScheduledReboot(sysRes.data)
      }

      if (fileRes.data) {
        setFiles(fileRes.data.files || [])
      }

      await checkHealth()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()

    const interval = setInterval(() => {
      void checkHealth()
    }, 30000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAccordionChange =
    (panel: string) =>
    (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  const clearError = () => {
    setError(null)
  }

  const clearSuccess = () => {
    setSuccess(null)
  }

  const toggleDataConnection = async () => {
    try {
      setError(null)
      setSuccess(null)
      const newStatus = !dataStatus
      await api.setDataStatus(newStatus)
      setDataStatus(newStatus)
      setSuccess(t('configuration.actions.dataConnectionChanged', { status: newStatus ? t('common.enabled') : t('common.disabled') }))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const toggleAirplaneMode = async () => {
    try {
      setError(null)
      setSuccess(null)
      setAirplaneSwitching(true)
      const newEnabled = !airplaneMode?.enabled
      const response = await api.setAirplaneMode(newEnabled)
      if (response.data) {
        setAirplaneMode(response.data)
        setSuccess(t('configuration.actions.airplaneModeChanged', { status: newEnabled ? t('common.enabled') : t('common.disabled') }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setAirplaneSwitching(false)
    }
  }

  const getModeNameByValue = (mode: number) => {
    switch (mode) {
      case 1:
        return 'CDC-NCM'
      case 2:
        return 'CDC-ECM'
      case 3:
        return 'RNDIS'
      default:
        return 'Unknown'
    }
  }

  const applyUsbMode = async () => {
    try {
      setError(null)
      setSuccess(null)
      await api.setUsbMode(selectedUsbMode, usbModePermanent)
      const modeType = usbModePermanent ? t('configuration.usb.permanent') : t('configuration.usb.temporary')
      setSuccess(t('configuration.actions.usbModeSaved', { mode: getModeNameByValue(selectedUsbMode), type: modeType }))
      setTimeout(() => {
        void loadData()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const applyUsbModeHot = async () => {
    try {
      setError(null)
      setSuccess(null)
      setHotSwitching(true)
      await api.setUsbModeAdvance(selectedUsbMode)
      setSuccess(t('configuration.actions.usbHotSwitched', { mode: getModeNameByValue(selectedUsbMode) }))
      setTimeout(() => {
        void loadData()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setHotSwitching(false)
    }
  }

  const handleUsbModeApply = () => {
    if (useHotSwitch) {
      void applyUsbModeHot()
      return
    }

    void applyUsbMode()
  }

  const rebootSystem = async () => {
    try {
      setError(null)
      setSuccess(null)
      setRebooting(true)
      await api.systemReboot(3)
      setSuccess(t('configuration.actions.systemRebooting'))
    } catch (err) {
      setRebooting(false)
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleSaveWebhook = async () => {
    setWebhookLoading(true)
    setError(null)
    try {
      const response = await api.setWebhookConfig(webhookConfig)
      if (response.status === 'ok') {
          setSuccess(t('configuration.actions.webhookSaved'))
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setWebhookLoading(false)
    }
  }

  const handleTestWebhook = async () => {
    setWebhookTesting(true)
    setError(null)
    try {
      const response = await api.testWebhook()
      if (response.status === 'ok' && response.data) {
        if (response.data.success) {
          setSuccess(response.data.message)
        } else {
          setError(response.data.message)
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setWebhookTesting(false)
    }
  }

  const handleAddHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderValue.trim()) {
      return
    }

    setWebhookConfig((current) => ({
      ...current,
      headers: {
        ...current.headers,
        [newHeaderKey.trim()]: newHeaderValue.trim(),
      },
    }))
    setNewHeaderKey('')
    setNewHeaderValue('')
  }

  const handleRemoveHeader = (key: string) => {
    setWebhookConfig((current) => {
      const nextHeaders = { ...current.headers }
      delete nextHeaders[key]

      return {
        ...current,
        headers: nextHeaders,
      }
    })
  }

  const updateWebhookConfig = (patch: Partial<WebhookConfig>) => {
    setWebhookConfig((current) => ({
      ...current,
      ...patch,
    }))
  }

  const resetWebhookTemplates = () => {
    setWebhookConfig((current) => ({
      ...current,
      sms_template: DEFAULT_SMS_TEMPLATE,
      call_template: DEFAULT_CALL_TEMPLATE,
    }))
  }

  // ===== 定时重启操作 =====
  const updateScheduledRebootConfig = (patch: Partial<ScheduledRebootConfig>) => {
    setScheduledReboot((current) => ({
      ...current,
      ...patch,
    }))
  }

  const handleSaveScheduledReboot = async () => {
    setScheduledRebootSaving(true)
    setError(null)
    try {
      const response = await api.setScheduledReboot(scheduledReboot)
      if (response.status === 'ok') {
        setSuccess(response.message)
        // 重新获取以更新状态描述
        const fresh = await api.getScheduledReboot()
        if (fresh.data) {
          setScheduledReboot(fresh.data)
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setScheduledRebootSaving(false)
    }
  }

  // ===== 文件管理操作 =====
  const loadFiles = async () => {
    try {
      const res = await api.getFileList()
      if (res.data) setFiles(res.data.files || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleUploadFile = async (file: File) => {
    setFilesUploading(true)
    setError(null)
    try {
      const res = await api.uploadFile(file)
      if (res.status === 'ok') {
        setSuccess(res.message)
        await loadFiles()
      } else {
        setError(res.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setFilesUploading(false)
    }
  }

  const handleDeleteFile = async (filename: string) => {
    setError(null)
    try {
      const res = await api.deleteFile(filename)
      if (res.status === 'ok') {
        setSuccess(res.message)
        await loadFiles()
      } else {
        setError(res.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return {
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    expanded,
    handleAccordionChange,
    dataStatus,
    toggleDataConnection,
    usbMode,
    selectedUsbMode,
    setSelectedUsbMode,
    usbModePermanent,
    setUsbModePermanent,
    useHotSwitch,
    setUseHotSwitch,
    rebooting,
    hotSwitching,
    handleUsbModeApply,
    rebootSystem,
    airplaneMode,
    airplaneSwitching,
    toggleAirplaneMode,
    healthStatus,
    healthLoading,
    checkHealth,
    getModeNameByValue,
    webhookConfig,
    updateWebhookConfig,
    webhookLoading,
    webhookTesting,
    newHeaderKey,
    newHeaderValue,
    setNewHeaderKey,
    setNewHeaderValue,
    handleAddHeader,
    handleRemoveHeader,
    resetWebhookTemplates,
    handleSaveWebhook,
    handleTestWebhook,
    // 系统管理
    scheduledReboot,
    updateScheduledRebootConfig,
    handleSaveScheduledReboot,
    scheduledRebootSaving,
    adbTcpStatus,
    // 文件管理
    files,
    filesUploading,
    handleUploadFile,
    handleDeleteFile,
    loadFiles,
  }
}
