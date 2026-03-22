import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Home, Language, Link as LinkIcon, Lock, Public } from '@mui/icons-material'
import { api, type BandLockRequest, type BandLockStatus, type RadioMode } from '../../../api'
import type {
  ApnContext,
  CellLocationResponse,
  CellLockStatusResponse,
  CellsResponse,
  NetworkInterfaceInfo,
  OperatorListResponse,
} from '../../../api/types'

const LTE_FDD_BANDS = [1, 3, 5, 8]
const LTE_TDD_BANDS = [39, 41]
const NR_FDD_BANDS = [1, 3, 28]
const NR_TDD_BANDS = [41, 77, 78, 79]

type UseNetworkPageControllerOptions = {
  refreshInterval: number
  refreshKey: number
}

export default function useNetworkPageController({
  refreshInterval,
  refreshKey,
}: UseNetworkPageControllerOptions) {
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [cellsInfo, setCellsInfo] = useState<CellsResponse | null>(null)
  const [operators, setOperators] = useState<OperatorListResponse | null>(null)
  const [cellLocation, setCellLocation] = useState<CellLocationResponse | null>(null)
  const [scanning, setScanning] = useState(false)
  const [registering, setRegistering] = useState(false)

  const [lockingCell, setLockingCell] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [cellLockStatus, setCellLockStatus] = useState<CellLockStatusResponse | null>(null)

  const [interfaces, setInterfaces] = useState<NetworkInterfaceInfo[]>([])
  const [showDownInterfaces, setShowDownInterfaces] = useState(false)
  const [showIpAddresses, setShowIpAddresses] = useState(false)

  const [currentRadioMode, setCurrentRadioMode] = useState<RadioMode>('auto')
  const [lockMode, setLockMode] = useState<'unlocked' | 'custom'>('unlocked')
  const [lteFddBands, setLteFddBands] = useState<number[]>([])
  const [lteTddBands, setLteTddBands] = useState<number[]>([])
  const [nrFddBands, setNrFddBands] = useState<number[]>([])
  const [nrTddBands, setNrTddBands] = useState<number[]>([])
  const [_bandLockStatus, setBandLockStatus] = useState<BandLockStatus | null>(null)
  const [modeLoading, setModeLoading] = useState(false)
  const [bandLoading, setBandLoading] = useState(false)
  const [bandConfigRefreshing, setBandConfigRefreshing] = useState(false)

  const [apnContexts, setApnContexts] = useState<ApnContext[]>([])
  const [selectedContext, setSelectedContext] = useState('')
  const [apnForm, setApnForm] = useState({
    apn: '',
    protocol: 'dual',
    username: '',
    password: '',
    auth_method: 'chap',
  })
  const [apnSaving, setApnSaving] = useState(false)
  const [apnInitialized, setApnInitialized] = useState(false)

  const loadBandLockConfig = async () => {
    try {
      setBandConfigRefreshing(true)
      const [radioModeRes, bandLockRes] = await Promise.all([api.getRadioMode(), api.getBandLockStatus()])

      if (radioModeRes.data) {
        const mode = radioModeRes.data.mode
        if (mode === 'auto' || mode === 'lte' || mode === 'nr') {
          setCurrentRadioMode(mode as RadioMode)
        }
      }

      if (bandLockRes.data) {
        setBandLockStatus(bandLockRes.data)
        const isLocked = bandLockRes.data.locked
        const hasAnyBands =
          bandLockRes.data.lte_fdd_bands.length > 0 ||
          bandLockRes.data.lte_tdd_bands.length > 0 ||
          bandLockRes.data.nr_fdd_bands.length > 0 ||
          bandLockRes.data.nr_tdd_bands.length > 0

        if (!isLocked || !hasAnyBands) {
          setLockMode('unlocked')
          setLteFddBands([])
          setLteTddBands([])
          setNrFddBands([])
          setNrTddBands([])
        } else {
          setLockMode('custom')
          setLteFddBands(bandLockRes.data.lte_fdd_bands)
          setLteTddBands(bandLockRes.data.lte_tdd_bands)
          setNrFddBands(bandLockRes.data.nr_fdd_bands)
          setNrTddBands(bandLockRes.data.nr_tdd_bands)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBandConfigRefreshing(false)
    }
  }

  const loadData = async () => {
    setError(null)
    try {
      const [cellsRes, operatorsRes, cellLocRes, cellLockRes, interfacesRes, apnRes] = await Promise.all([
        api.getCellsInfo(),
        api.getOperators(),
        api.getCellLocationInfo(),
        api.getCellLockStatus(),
        api.getNetworkInterfaces(),
        api.getApnList(),
      ])

      if (cellsRes.data) setCellsInfo(cellsRes.data)
      if (operatorsRes.data) setOperators(operatorsRes.data)
      if (cellLocRes.data) setCellLocation(cellLocRes.data)
      if (cellLockRes.data) setCellLockStatus(cellLockRes.data)
      if (interfacesRes.data) setInterfaces(interfacesRes.data.interfaces)

      if (apnRes.data?.contexts) {
        setApnContexts(apnRes.data.contexts)
        if (!apnInitialized) {
          const activeContext = apnRes.data.contexts.find((context) => context.apn) || apnRes.data.contexts[0]
          if (activeContext) {
            setSelectedContext(activeContext.path)
            setApnForm({
              apn: activeContext.apn,
              protocol: activeContext.protocol,
              username: activeContext.username,
              password: activeContext.password,
              auth_method: activeContext.auth_method,
            })
          }
          setApnInitialized(true)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setInitialLoading(false)
    }
  }

  const loadAllData = async () => {
    await Promise.all([loadData(), loadBandLockConfig()])
  }

  const refreshData = () => {
    void loadData()
  }

  const refreshBandConfig = () => {
    void loadBandLockConfig()
  }

  const handleScanOperators = () => {
    void (async () => {
      setScanning(true)
      setError(null)
      try {
        const response = await api.scanOperators()
        if (response.status === 'ok' && response.data) {
          setOperators(response.data)
          setSuccess(`Scan completed. Found ${response.data.operators.length} operators.`)
        } else {
          setError(response.message || 'Operator scan failed.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setScanning(false)
      }
    })()
  }

  const handleRegisterManual = (mccmnc: string) => {
    void (async () => {
      setRegistering(true)
      setError(null)
      try {
        const response = await api.registerOperatorManual(mccmnc)
        if (response.status === 'ok') {
          setSuccess(`Registering with operator ${mccmnc}...`)
          setTimeout(() => void loadData(), 3000)
        } else {
          setError(response.message || 'Manual registration failed.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setRegistering(false)
      }
    })()
  }

  const handleRegisterAuto = () => {
    void (async () => {
      setRegistering(true)
      setError(null)
      try {
        const response = await api.registerOperatorAuto()
        if (response.status === 'ok') {
          setSuccess('Started automatic operator registration.')
          setTimeout(() => void loadData(), 3000)
        } else {
          setError(response.message || 'Automatic registration failed.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setRegistering(false)
      }
    })()
  }

  const locationCells = (() => {
    if (!cellLocation?.available) return []
    const cells: typeof cellLocation.neighbor_cells = []
    if (cellLocation.cell_info) cells.push(cellLocation.cell_info)
    cells.push(...cellLocation.neighbor_cells)
    return cells
  })()

  const handleCopyCellLocation = () => {
    if (!locationCells.length) return
    void navigator.clipboard.writeText(JSON.stringify(locationCells[0], null, 2))
    setSuccess('Copied cell location payload to the clipboard.')
  }

  const handleLockCell = async (tech: string, arfcn: string, pci: string) => {
    const cellKey = `${tech}-${arfcn}-${pci}`
    setLockingCell(cellKey)
    setError(null)
    try {
      const rat = tech.toLowerCase() === 'nr' || tech === 'NR' ? 16 : 12
      const arfcnNum = parseInt(arfcn, 10)
      const pciNum = parseInt(pci, 10)
      if (Number.isNaN(arfcnNum) || Number.isNaN(pciNum)) {
        setError('Invalid ARFCN or PCI value.')
        return
      }
      const result = await api.setCellLock({ rat, enable: true, arfcn: arfcnNum, pci: pciNum })
      if (result.status === 'ok') {
        setSuccess(`Locked ${tech.toUpperCase()} cell ARFCN=${arfcn}, PCI=${pci}.`)
        setTimeout(() => void loadData(), 2000)
      } else {
        setError(result.message || 'Cell lock failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLockingCell(null)
    }
  }

  const handleUnlockAllCells = async () => {
    setUnlocking(true)
    setError(null)
    try {
      const result = await api.unlockAllCells()
      if (result.status === 'ok') {
        setSuccess('Removed all active cell locks.')
        setTimeout(() => void loadData(), 2000)
      } else {
        setError(result.message || 'Failed to unlock cells.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUnlocking(false)
    }
  }

  const handleRadioModeChange = async (mode: RadioMode) => {
    setModeLoading(true)
    setError(null)
    try {
      const response = await api.setRadioMode(mode)
      setSuccess(response.message || 'Radio mode updated.')
      setCurrentRadioMode(mode)
      setTimeout(() => void loadBandLockConfig(), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setModeLoading(false)
    }
  }

  const handleApplyBandLock = async () => {
    setBandLoading(true)
    setError(null)
    const request: BandLockRequest =
      lockMode === 'unlocked'
        ? { lte_fdd_bands: [], lte_tdd_bands: [], nr_fdd_bands: [], nr_tdd_bands: [] }
        : { lte_fdd_bands: lteFddBands, lte_tdd_bands: lteTddBands, nr_fdd_bands: nrFddBands, nr_tdd_bands: nrTddBands }

    try {
      const response = await api.setBandLock(request)
      setSuccess(response.message || 'Band lock settings applied.')
      setTimeout(() => void loadBandLockConfig(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBandLoading(false)
    }
  }

  const handleUnlockAllBands = async () => {
    setBandLoading(true)
    setError(null)
    try {
      const response = await api.setBandLock({
        lte_fdd_bands: [],
        lte_tdd_bands: [],
        nr_fdd_bands: [],
        nr_tdd_bands: [],
      })
      setSuccess(response.message || 'Band restrictions cleared.')
      setLteFddBands([])
      setLteTddBands([])
      setNrFddBands([])
      setNrTddBands([])
      setTimeout(() => void loadBandLockConfig(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBandLoading(false)
    }
  }

  const toggleBand = (band: number, setter: Dispatch<SetStateAction<number[]>>) => {
    setter((current) => (current.includes(band) ? current.filter((item) => item !== band) : [...current, band]))
  }

  const handleContextChange = (path: string) => {
    setSelectedContext(path)
    const context = apnContexts.find((item) => item.path === path)
    if (context) {
      setApnForm({
        apn: context.apn,
        protocol: context.protocol,
        username: context.username,
        password: context.password,
        auth_method: context.auth_method,
      })
    }
  }

  const updateApnForm = (patch: Partial<typeof apnForm>) => {
    setApnForm((current) => ({ ...current, ...patch }))
  }

  const saveApn = async () => {
    if (!selectedContext) {
      setError('Please select an APN context first.')
      return
    }
    try {
      setError(null)
      setSuccess(null)
      setApnSaving(true)
      await api.setApn({
        context_path: selectedContext,
        apn: apnForm.apn || undefined,
        protocol: apnForm.protocol || undefined,
        username: apnForm.username || undefined,
        password: apnForm.password || undefined,
        auth_method: apnForm.auth_method || undefined,
      })
      setSuccess('APN configuration saved.')
      setTimeout(() => void loadData(), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setApnSaving(false)
    }
  }

  const getProtocolName = (protocol: string) => {
    switch (protocol) {
      case 'ip':
        return 'IPv4'
      case 'ipv6':
        return 'IPv6'
      case 'dual':
        return 'IPv4v6'
      default:
        return protocol
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const index = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, index)).toFixed(2)} ${sizes[index]}`
  }

  const getInterfaceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
        return 'success'
      case 'down':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getScopeIcon = (scope: string) => {
    switch (scope.toLowerCase()) {
      case 'public':
        return <Public fontSize="small" />
      case 'private':
        return <Home fontSize="small" />
      case 'loopback':
        return <Lock fontSize="small" />
      case 'link-local':
        return <LinkIcon fontSize="small" />
      default:
        return <Language fontSize="small" />
    }
  }

  const getScopeColor = (scope: string) => {
    switch (scope.toLowerCase()) {
      case 'public':
        return 'success'
      case 'private':
        return 'primary'
      case 'loopback':
        return 'default'
      case 'link-local':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getScopeLabel = (scope: string) => {
    switch (scope.toLowerCase()) {
      case 'public':
        return 'Public'
      case 'private':
        return 'Private'
      case 'loopback':
        return 'Loopback'
      case 'link-local':
        return 'Link-local'
      default:
        return scope
    }
  }

  const getIpAddressStyle = () =>
    ({
      filter: showIpAddresses ? 'none' : 'blur(5px)',
      transition: 'filter 0.3s ease',
      userSelect: showIpAddresses ? 'auto' : 'none',
      cursor: showIpAddresses ? 'text' : 'default',
    }) as const

  const filteredInterfaces = showDownInterfaces
    ? interfaces
    : interfaces.filter((iface) => iface.status.toLowerCase() !== 'down')

  useEffect(() => {
    void loadAllData()
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        void loadData()
      }, refreshInterval)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval, refreshKey])

  const convertSignalValue = (value: string | number | undefined): number | null => {
    if (value === undefined || value === null) return null
    const numericValue = typeof value === 'string' ? parseFloat(value) : value
    if (Number.isNaN(numericValue)) return null
    return numericValue / 100
  }

  const formatSignalValue = (value: string | number | undefined): string => {
    const converted = convertSignalValue(value)
    if (converted === null) return '-'
    return converted.toFixed(2)
  }

  const getSignalChipColor = (rsrp?: string | number, rssi?: string | number) => {
    const rsrpValue = convertSignalValue(rsrp)
    const rssiValue = convertSignalValue(rssi)
    const value = rsrpValue || rssiValue || -120
    if (value >= -80) return 'success'
    if (value >= -100) return 'primary'
    if (value >= -110) return 'warning'
    return 'error'
  }

  return {
    initialLoading,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
    refreshData,
    cellsInfo,
    operators,
    scanning,
    registering,
    handleScanOperators,
    handleRegisterAuto,
    handleRegisterManual,
    cellLockStatus,
    lockingCell,
    unlocking,
    handleUnlockAllCells,
    handleLockCell,
    currentRadioMode,
    modeLoading,
    handleRadioModeChange,
    bandConfigRefreshing,
    refreshBandConfig,
    lockMode,
    setLockMode,
    bandLoading,
    lteFddBands,
    setLteFddBands,
    lteTddBands,
    setLteTddBands,
    nrFddBands,
    setNrFddBands,
    nrTddBands,
    setNrTddBands,
    lteFddBandOptions: LTE_FDD_BANDS,
    lteTddBandOptions: LTE_TDD_BANDS,
    nrFddBandOptions: NR_FDD_BANDS,
    nrTddBandOptions: NR_TDD_BANDS,
    toggleBand,
    handleApplyBandLock,
    handleUnlockAllBands,
    locationCells,
    handleCopyCellLocation,
    formatSignalValue,
    getSignalChipColor,
    interfaces,
    filteredInterfaces,
    showIpAddresses,
    setShowIpAddresses,
    showDownInterfaces,
    setShowDownInterfaces,
    getInterfaceStatusColor,
    getScopeIcon,
    getScopeColor,
    getScopeLabel,
    getIpAddressStyle,
    formatBytes,
    apnContexts,
    selectedContext,
    apnForm,
    apnSaving,
    handleContextChange,
    updateApnForm,
    saveApn,
    getProtocolName,
  }
}
