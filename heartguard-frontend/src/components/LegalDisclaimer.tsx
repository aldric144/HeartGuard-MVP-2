import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LegalDisclaimerProps {
  variant?: 'inline' | 'prominent'
  context?: 'general' | 'trustscore' | 'evidence' | 'guardian'
}

export function LegalDisclaimer({ variant = 'inline', context = 'general' }: LegalDisclaimerProps) {
  const getDisclaimerText = () => {
    switch (context) {
      case 'trustscore':
        return 'AI-generated Trust Score for informational purposes only. Not legal, financial, or professional advice. Do not rely solely on this assessment. In emergencies or suspected crimes, contact law enforcement immediately.'
      case 'evidence':
        return 'Evidence Locker™ reports are for informational and documentation purposes only. Not a certified legal document. Not a background check. Not for employment, credit, or housing decisions. Not FCRA compliant. Consult legal counsel for official proceedings.'
      case 'guardian':
        return 'Guardian Mode™ safety replies are suggestions only. Not professional advice. Use your judgment. In dangerous situations, contact law enforcement immediately. HeartGuard™ is not liable for outcomes of using these suggestions.'
      default:
        return 'HeartGuard™ provides AI-powered analysis for informational purposes only. Not legal, financial, or professional advice. No guarantee of accuracy. Not a Consumer Reporting Agency. Not for FCRA-regulated purposes. Always verify information independently and contact authorities for suspected crimes.'
    }
  }

  if (variant === 'prominent') {
    return (
      <Alert className="bg-yellow-50 border-yellow-400 border-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-900 font-semibold">
          <strong>IMPORTANT DISCLAIMER:</strong> {getDisclaimerText()}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="text-xs text-gray-600 italic border-t border-gray-300 pt-2 mt-4">
      <AlertTriangle className="inline h-3 w-3 mr-1" />
      <strong>Disclaimer:</strong> {getDisclaimerText()}
    </div>
  )
}
