import { useState, type SyntheticEvent } from 'react'
import { Alert, Box, CircularProgress, Paper, Snackbar, Tab, Tabs } from '@mui/material'
import { Business, CellTower, Router, SimCard } from '@mui/icons-material'
import ErrorSnackbar from '../components/ErrorSnackbar'
import PageHero from '../components/PageHero'
import { useRefreshInterval } from '../contexts/RefreshContext'
import { useI18n } from '../contexts/I18nContext'
import { alpha } from '../utils/theme'
import NetworkApnTab from './Network/components/NetworkApnTab'
import NetworkCellsTab from './Network/components/NetworkCellsTab'
import NetworkInterfacesTab from './Network/components/NetworkInterfacesTab'
import NetworkOperatorsTab from './Network/components/NetworkOperatorsTab'
import NetworkTabPanel from './Network/components/NetworkTabPanel'
import useNetworkPageController from './Network/hooks/useNetworkPageController'

export default function NetworkPage() {
  const { refreshInterval, refreshKey } = useRefreshInterval()
  const { t } = useI18n()
  const [tabValue, setTabValue] = useState(0)
  const {
    initialLoading,
    error,
    success,
    clearError,
    clearSuccess,
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
    lteFddBandOptions,
    lteTddBandOptions,
    nrFddBandOptions,
    nrTddBandOptions,
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
  } = useNetworkPageController({ refreshInterval, refreshKey })

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        '& .MuiCard-root': { borderRadius: 5 },
        '& .MuiAccordion-root': {
          borderRadius: 5,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          '&::before': { display: 'none' },
        },
      }}
    >
      <ErrorSnackbar error={error} onClose={clearError} />
      <Snackbar open={!!success} autoHideDuration={3000} onClose={clearSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={clearSuccess}>{success}</Alert>
      </Snackbar>

      <PageHero
        eyebrow={t('network.page.eyebrow')}
        title={t('network.page.title')}
        description={t('network.page.description')}
        chips={[
          refreshInterval === 0 ? t('common.manualRefresh') : t('common.autoRefresh', { seconds: refreshInterval / 1000 }),
          t('network.page.interfaces', { count: interfaces.length }),
          t('network.page.operators', { count: operators?.operators?.length || 0 }),
        ]}
      />

      <Paper
        sx={(theme) => ({
          mb: 2.5,
          p: 1,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.78 : 0.88),
          '& .MuiTabs-indicator': {
            height: 32,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.16),
            zIndex: 0,
          },
          '& .MuiTab-root': {
            minHeight: 48,
            borderRadius: 4,
            textTransform: 'none',
            fontWeight: 600,
            position: 'relative',
            zIndex: 1,
          },
        })}
      >
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('network.tabs.cells')} icon={<CellTower />} iconPosition="start" />
          <Tab label={t('network.tabs.apn')} icon={<SimCard />} iconPosition="start" />
          <Tab label={t('network.tabs.interfaces')} icon={<Router />} iconPosition="start" />
          <Tab label={t('network.tabs.operators')} icon={<Business />} iconPosition="start" />
        </Tabs>
      </Paper>

      <NetworkTabPanel value={tabValue} index={3}>
        <NetworkOperatorsTab
          operators={operators}
          scanning={scanning}
          registering={registering}
          onRefresh={refreshData}
          onScan={handleScanOperators}
          onAutoRegister={handleRegisterAuto}
          onManualRegister={handleRegisterManual}
        />
      </NetworkTabPanel>

      <NetworkTabPanel value={tabValue} index={0}>
        <NetworkCellsTab
          cellsInfo={cellsInfo}
          cellLockStatus={cellLockStatus}
          lockingCell={lockingCell}
          unlocking={unlocking}
          onUnlockAllCells={() => void handleUnlockAllCells()}
          onLockCell={(tech, arfcn, pci) => void handleLockCell(tech, arfcn, pci)}
          currentRadioMode={currentRadioMode}
          modeLoading={modeLoading}
          onRadioModeChange={(mode) => void handleRadioModeChange(mode)}
          bandConfigRefreshing={bandConfigRefreshing}
          onRefreshBandConfig={refreshBandConfig}
          lockMode={lockMode}
          onLockModeChange={setLockMode}
          bandLoading={bandLoading}
          lteFddBands={lteFddBands}
          setLteFddBands={setLteFddBands}
          lteTddBands={lteTddBands}
          setLteTddBands={setLteTddBands}
          nrFddBands={nrFddBands}
          setNrFddBands={setNrFddBands}
          nrTddBands={nrTddBands}
          setNrTddBands={setNrTddBands}
          lteFddBandOptions={lteFddBandOptions}
          lteTddBandOptions={lteTddBandOptions}
          nrFddBandOptions={nrFddBandOptions}
          nrTddBandOptions={nrTddBandOptions}
          toggleBand={toggleBand}
          onApplyBandLock={() => void handleApplyBandLock()}
          onUnlockAllBands={() => void handleUnlockAllBands()}
          locationCells={locationCells}
          onCopyCellLocation={handleCopyCellLocation}
          formatSignalValue={formatSignalValue}
          getSignalChipColor={getSignalChipColor}
        />
      </NetworkTabPanel>

      <NetworkTabPanel value={tabValue} index={2}>
        <NetworkInterfacesTab
          interfaces={interfaces}
          filteredInterfaces={filteredInterfaces}
          showIpAddresses={showIpAddresses}
          onShowIpAddressesChange={setShowIpAddresses}
          showDownInterfaces={showDownInterfaces}
          onShowDownInterfacesChange={setShowDownInterfaces}
          getInterfaceStatusColor={getInterfaceStatusColor}
          getScopeIcon={getScopeIcon}
          getScopeColor={getScopeColor}
          getScopeLabel={getScopeLabel}
          getIpAddressStyle={getIpAddressStyle}
          formatBytes={formatBytes}
        />
      </NetworkTabPanel>

      <NetworkTabPanel value={tabValue} index={1}>
        <NetworkApnTab
          apnContexts={apnContexts}
          selectedContext={selectedContext}
          apnForm={apnForm}
          apnSaving={apnSaving}
          onContextChange={handleContextChange}
          onFormChange={updateApnForm}
          onSave={() => void saveApn()}
          getProtocolName={getProtocolName}
        />
      </NetworkTabPanel>
    </Box>
  )
}
