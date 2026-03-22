/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  localeOptions,
  messageCatalog,
  type Locale,
  type MessageTree,
} from '@/i18n/messages'

interface TranslationValues {
  [key: string]: string | number | null | undefined
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: TranslationValues) => string
  formatNumber: (value: number) => string
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string
  formatTime: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string
  localeOptions: typeof localeOptions
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function resolveInitialLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved === 'zh-CN' || saved === 'en-US') {
    return saved
  }

  const browserLanguage = navigator.language.toLowerCase()
  if (browserLanguage.startsWith('zh')) {
    return 'zh-CN'
  }

  if (browserLanguage.startsWith('en')) {
    return 'en-US'
  }

  return DEFAULT_LOCALE
}

function getMessageValue(messages: MessageTree, key: string): string | undefined {
  const result = key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined
    }

    return (current as Record<string, unknown>)[segment]
  }, messages)

  return typeof result === 'string' ? result : undefined
}

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = values[key]
    return value === null || value === undefined ? '' : String(value)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale)

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }

  const value = useMemo<I18nContextValue>(() => {
    const messages = messageCatalog[locale]
    const fallbackMessages = messageCatalog[DEFAULT_LOCALE]

    return {
      locale,
      setLocale,
      t: (key, values) => {
        const resolved = getMessageValue(messages, key) ?? getMessageValue(fallbackMessages, key) ?? key
        return interpolate(resolved, values)
      },
      formatNumber: (value) => new Intl.NumberFormat(locale).format(value),
      formatDate: (value, options) => new Intl.DateTimeFormat(locale, options).format(new Date(value)),
      formatTime: (value, options) =>
        new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          ...options,
        }).format(new Date(value)),
      localeOptions,
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return context
}
