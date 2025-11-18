import { useEffect, useState } from 'react'
import { AlertTriangle, XCircle, AlertOctagon, Shield } from 'lucide-react'

interface WarningBannerProps {
  trustScore: number
  hasCriticalPatterns: boolean
  onDismiss?: () => void
}

type RiskLevel = 'critical' | 'high' | 'moderate' | 'low'

interface RiskConfig {
  level: RiskLevel
  message: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  borderColor: string
  showAsModal: boolean
}

export function WarningBanner({ trustScore, hasCriticalPatterns, onDismiss }: WarningBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isModalPhase, setIsModalPhase] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const config = getRiskConfig(trustScore, hasCriticalPatterns)
    if (config.showAsModal && !prefersReducedMotion) {
      const timer = setTimeout(() => {
        setIsModalPhase(false)
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setIsModalPhase(false)
    }
  }, [trustScore, hasCriticalPatterns, prefersReducedMotion])

  const getRiskConfig = (score: number, hasCritical: boolean): RiskConfig => {
    let effectiveScore = score
    if (hasCritical && score <= 60) {
      effectiveScore = Math.max(0, score - 10)
    }

    if (effectiveScore <= 40) {
      return {
        level: 'critical',
        message: '🚨 CRITICAL - FRAUD PATTERNS DETECTED - STAY AWAY 🚨',
        icon: <AlertOctagon className="w-8 h-8" />,
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        borderColor: 'border-red-800',
        showAsModal: true
      }
    } else if (effectiveScore <= 60) {
      return {
        level: 'high',
        message: '⚠️ HIGH RISK - PROCEED WITH EXTREME CAUTION ⚠️',
        icon: <XCircle className="w-8 h-8" />,
        bgColor: 'bg-orange-600',
        textColor: 'text-white',
        borderColor: 'border-orange-800',
        showAsModal: true
      }
    } else if (effectiveScore <= 80) {
      return {
        level: 'moderate',
        message: '⚠️ MODERATE RISK - VERIFY CAREFULLY',
        icon: <AlertTriangle className="w-6 h-6" />,
        bgColor: 'bg-yellow-500',
        textColor: 'text-gray-900',
        borderColor: 'border-yellow-700',
        showAsModal: false
      }
    } else {
      return {
        level: 'low',
        message: '🛡️ LOW RISK - REMAIN VIGILANT',
        icon: <Shield className="w-6 h-6" />,
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
        borderColor: 'border-blue-700',
        showAsModal: false
      }
    }
  }

  const config = getRiskConfig(trustScore, hasCriticalPatterns)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isModalPhase) {
        setIsModalPhase(false)
      } else {
        handleDismiss()
      }
    }
  }

  if (!isVisible) return null

  if (isModalPhase && config.showAsModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={() => setIsModalPhase(false)}
        onKeyDown={handleKeyDown}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div 
          className={`
            ${config.bgColor} ${config.textColor} ${config.borderColor}
            border-4 rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl
            ${!prefersReducedMotion ? 'animate-pulse-border' : ''}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={!prefersReducedMotion ? 'animate-bounce' : ''}>
              {config.icon}
            </div>
            <h2 className="text-3xl font-bold tracking-wide">
              {config.message}
            </h2>
            <p className="text-lg opacity-90">
              This analysis has detected serious warning signs. Please review the detailed report below and consider seeking additional verification.
            </p>
            <button
              onClick={() => setIsModalPhase(false)}
              className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
            >
              View Full Report
            </button>
            <p className="text-sm opacity-75">
              Press ESC or click anywhere to continue
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border-2 rounded-lg p-4 mb-6 shadow-lg
        ${!prefersReducedMotion && config.level === 'critical' ? 'animate-pulse-subtle' : ''}
      `}
      role="alert"
      aria-live={config.level === 'critical' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {config.icon}
          <span className="font-bold text-lg">
            {config.message}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="hover:opacity-75 transition-opacity"
          aria-label="Dismiss warning"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
