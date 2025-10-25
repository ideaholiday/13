'use client'

import { useState } from 'react'
import { Globe, IndianRupee, Check } from 'lucide-react'
import { useLocaleStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
]

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
]

interface LocaleSelectorProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function LocaleSelector({ variant = 'compact', className }: LocaleSelectorProps) {
  const { preferences, setLanguage, setCurrency } = useLocaleStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language')

  const language = preferences.language
  const currency = preferences.currency
  
  const currentLanguage = languages.find(l => l.code === language) || languages[0]
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]

  const handleLanguageSelect = (code: string) => {
    setLanguage(code)
    if (variant === 'compact') {
      setIsOpen(false)
    }
  }

  const handleCurrencySelect = (code: string) => {
    setCurrency(code)
    if (variant === 'compact') {
      setIsOpen(false)
    }
  }

  if (variant === 'full') {
    // Full version for settings page or mobile menu
    return (
      <div className={cn('space-y-6', className)}>
        {/* Language Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sapphire-600" />
            Language
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]',
                  language === lang.code
                    ? 'border-sapphire-500 bg-sapphire-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-sapphire-300'
                )}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900">{lang.name}</div>
                  <div className="text-sm text-slate-600">{lang.nativeName}</div>
                </div>
                {language === lang.code && (
                  <Check className="w-5 h-5 text-sapphire-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            Currency
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr.code)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]',
                  currency === curr.code
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                )}
              >
                <span className="text-3xl">{curr.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900">
                    {curr.symbol} {curr.code}
                  </div>
                  <div className="text-sm text-slate-600">{curr.name}</div>
                </div>
                {currency === curr.code && (
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Compact version for header
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">
          {currentLanguage.flag} {currentCurrency.symbol}
        </span>
        <span className="sm:hidden text-lg">
          {currentLanguage.flag}
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 z-50"
            >
              <Card className="w-80 shadow-xl border-slate-200">
                <CardContent className="p-0">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setActiveTab('language')}
                      className={cn(
                        'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                        activeTab === 'language'
                          ? 'text-sapphire-900 border-b-2 border-sapphire-600 bg-sapphire-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </button>
                    <button
                      onClick={() => setActiveTab('currency')}
                      className={cn(
                        'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                        activeTab === 'currency'
                          ? 'text-emerald-900 border-b-2 border-emerald-600 bg-emerald-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <IndianRupee className="w-4 h-4 inline mr-2" />
                      Currency
                    </button>
                  </div>

                  {/* Content */}
                  <div className="max-h-80 overflow-y-auto">
                    {activeTab === 'language' ? (
                      <div className="p-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-slate-50',
                              language === lang.code && 'bg-sapphire-50'
                            )}
                          >
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-slate-900">{lang.name}</div>
                              <div className="text-xs text-slate-600">{lang.nativeName}</div>
                            </div>
                            {language === lang.code && (
                              <Check className="w-4 h-4 text-sapphire-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2">
                        {currencies.map((curr) => (
                          <button
                            key={curr.code}
                            onClick={() => handleCurrencySelect(curr.code)}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-slate-50',
                              currency === curr.code && 'bg-emerald-50'
                            )}
                          >
                            <span className="text-2xl">{curr.flag}</span>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-slate-900">
                                {curr.symbol} {curr.code}
                              </div>
                              <div className="text-xs text-slate-600">{curr.name}</div>
                            </div>
                            {currency === curr.code && (
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-200 p-3 bg-slate-50">
                    <div className="text-xs text-slate-600 text-center">
                      Current: {currentLanguage.flag} {currentLanguage.name} • {currentCurrency.symbol} {currentCurrency.code}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
